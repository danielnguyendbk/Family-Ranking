package com.familyranking.service.impl;

import com.familyranking.dto.request.MatchRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.*;
import com.familyranking.entity.Match.MatchStatus;
import com.familyranking.exception.BadRequestException;
import com.familyranking.exception.ForbiddenException;
import com.familyranking.exception.ResourceNotFoundException;
import com.familyranking.repository.*;
import com.familyranking.service.MatchService;
import com.familyranking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PlayerGameStatsRepository statsRepository;
    private final UserService userService;
    private final TeamServiceImpl teamService;
    private final GameServiceImpl gameService;

    @Override
    public Response.MatchDto createMatch(User creator, MatchRequest request) {
        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        Match.MatchBuilder builder = Match.builder()
                .game(game)
                .teamMatch(request.isTeamMatch())
                .betType(request.getBetType())
                .betDescription(request.getBetDescription())
                .score1(request.getScore1())
                .score2(request.getScore2())
                .winnerId(request.getWinnerId())
                .createdBy(creator);

        if (request.isTeamMatch()) {
            Team team1 = teamRepository.findById(request.getTeam1Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Team 1 not found"));
            Team team2 = teamRepository.findById(request.getTeam2Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Team 2 not found"));
            builder.team1(team1).team2(team2);
        } else {
            User opponent = userRepository.findById(request.getOpponentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Opponent not found"));
            if (opponent.getId().equals(creator.getId())) {
                throw new BadRequestException("You cannot create a match against yourself");
            }
            builder.player1(creator).player2(opponent);
        }

        return mapToDto(matchRepository.save(builder.build()));
    }

    @Override
    public Response.MatchDto acceptMatch(User user, Long matchId) {
        Match match = getMatchOrThrow(matchId);

        assertOpponent(user, match);
        assertStatus(match, MatchStatus.PENDING);

        match.setStatus(MatchStatus.ACCEPTED);
        match.setResultConfirmedByOpponent(true);

        // Apply points
        applyPoints(match);
        match.setStatus(MatchStatus.COMPLETED);

        return mapToDto(matchRepository.save(match));
    }

    @Override
    public Response.MatchDto rejectMatch(User user, Long matchId) {
        Match match = getMatchOrThrow(matchId);
        assertOpponent(user, match);
        assertStatus(match, MatchStatus.PENDING);

        match.setStatus(MatchStatus.REJECTED);
        return mapToDto(matchRepository.save(match));
    }

    @Override
    public Response.MatchDto requestSettlement(User user, Long matchId) {
        Match match = getMatchOrThrow(matchId);
        assertStatus(match, MatchStatus.COMPLETED);

        // Only loser sends the settlement
        if (isWinner(user, match)) {
            throw new ForbiddenException("Only the loser sends the bet settlement");
        }
        if (!isParticipant(user, match)) {
            throw new ForbiddenException("You are not a participant in this match");
        }
        match.setBetSettledRequested(true);
        match.setBetSettledRequestedAt(LocalDateTime.now());
        return mapToDto(matchRepository.save(match));
    }

    @Override
    public Response.MatchDto confirmSettlement(User user, Long matchId) {
        Match match = getMatchOrThrow(matchId);
        assertStatus(match, MatchStatus.COMPLETED);

        if (!match.isBetSettledRequested()) {
            throw new BadRequestException("Settlement not sent yet");
        }
        // Winner confirms receipt
        if (!isWinner(user, match)) {
            throw new ForbiddenException("Only the winner can confirm settlement");
        }
        match.setBetSettledConfirmed(true);
        return mapToDto(matchRepository.save(match));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Response.MatchDto> getMyMatches(User user) {
        return matchRepository.findByUser(user).stream().map(this::mapToDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Response.RankingEntry> getRanking(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        List<PlayerGameStats> stats = statsRepository.findByGameOrderByPointsDesc(game);

        int[] rank = {1};
        List<Response.RankingEntry> result = new ArrayList<>();
        for (PlayerGameStats s : stats) {
            result.add(Response.RankingEntry.builder()
                    .rank(rank[0]++)
                    .userId(s.getUser().getId())
                    .username(s.getUser().getUsername())
                    .avatar(s.getUser().getAvatar())
                    .points(s.getPoints())
                    .wins(s.getWins())
                    .losses(s.getLosses())
                    .draws(s.getDraws())
                    .build());
        }
        return result;
    }

    // ===== Private helpers =====

    private void applyPoints(Match match) {
        Game game = match.getGame();

        if (match.isTeamMatch()) {
            // Team mode: apply to all members
            applyTeamPoints(match.getTeam1(), match.getTeam2(), match.getWinnerId(), game);
        } else {
            User p1 = match.getPlayer1();
            User p2 = match.getPlayer2();
            Long winnerId = determineWinnerId(match);

            if (winnerId == null) {
                // Draw
                addStats(p1, game, game.getDrawPoint(), 0, 0, 1);
                addStats(p2, game, game.getDrawPoint(), 0, 0, 1);
            } else if (winnerId.equals(p1.getId())) {
                addStats(p1, game, game.getWinPoint(), 1, 0, 0);
                addStats(p2, game, game.getLossPoint(), 0, 1, 0);
            } else {
                addStats(p2, game, game.getWinPoint(), 1, 0, 0);
                addStats(p1, game, game.getLossPoint(), 0, 1, 0);
            }
        }
    }

    private Long determineWinnerId(Match match) {
        if (match.getWinnerId() != null) return match.getWinnerId();
        if (match.getScore1() != null && match.getScore2() != null) {
            if (match.getScore1() > match.getScore2()) return match.getPlayer1().getId();
            if (match.getScore2() > match.getScore1()) return match.getPlayer2().getId();
            return null; // draw
        }
        return null;
    }

    private void applyTeamPoints(Team winner, Team loser, Long winnerId, Game game) {
        boolean team1Wins = (winnerId != null && winnerId.equals(winner.getId()));
        for (User member : winner.getMembers()) {
            addStats(member, game, team1Wins ? game.getWinPoint() : game.getLossPoint(),
                    team1Wins ? 1 : 0, team1Wins ? 0 : 1, 0);
        }
        for (User member : loser.getMembers()) {
            addStats(member, game, team1Wins ? game.getLossPoint() : game.getWinPoint(),
                    team1Wins ? 0 : 1, team1Wins ? 1 : 0, 0);
        }
    }

    private void addStats(User user, Game game, int pts, int wins, int losses, int draws) {
        PlayerGameStats stats = statsRepository.findByUserAndGame(user, game)
                .orElse(PlayerGameStats.builder().user(user).game(game).build());

        stats.setPoints(stats.getPoints() + pts);
        stats.setWins(stats.getWins() + wins);
        stats.setLosses(stats.getLosses() + losses);
        stats.setDraws(stats.getDraws() + draws);
        statsRepository.save(stats);

        // Update global stats on user
        user.setTotalPoints(user.getTotalPoints() + pts);
        user.setWins(user.getWins() + wins);
        user.setLosses(user.getLosses() + losses);
        user.setDraws(user.getDraws() + draws);
        userRepository.save(user);
    }

    private void assertOpponent(User user, Match match) {
        if (!match.isTeamMatch()) {
            boolean isP2 = match.getPlayer2() != null && match.getPlayer2().getId().equals(user.getId());
            if (!isP2) {
                throw new ForbiddenException("Only the opponent can perform this action");
            }
            return;
        }

        // Team match: allow any member of either team EXCEPT the creator to confirm/reject.
        // (The creator submits the result; the opposite side confirms it.)
        if (match.getCreatedBy() != null && match.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the opponent can perform this action");
        }

        boolean inTeam1 = match.getTeam1() != null && match.getTeam1().getMembers() != null
                && match.getTeam1().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        boolean inTeam2 = match.getTeam2() != null && match.getTeam2().getMembers() != null
                && match.getTeam2().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));

        if (!inTeam1 && !inTeam2) {
            throw new ForbiddenException("Only the opponent can perform this action");
        }
    }

    private void assertStatus(Match match, MatchStatus expected) {
        if (match.getStatus() != expected) {
            throw new BadRequestException("Match is not in " + expected + " status");
        }
    }

    private boolean isParticipant(User user, Match match) {
        if (!match.isTeamMatch()) {
            return (match.getPlayer1() != null && match.getPlayer1().getId().equals(user.getId()))
                    || (match.getPlayer2() != null && match.getPlayer2().getId().equals(user.getId()));
        }
        boolean inTeam1 = match.getTeam1() != null && match.getTeam1().getMembers() != null
                && match.getTeam1().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        boolean inTeam2 = match.getTeam2() != null && match.getTeam2().getMembers() != null
                && match.getTeam2().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        return inTeam1 || inTeam2;
    }

    private boolean isWinner(User user, Match match) {
        Long winnerId = determineWinnerId(match);
        if (winnerId == null) return false;

        if (!match.isTeamMatch()) {
            return winnerId.equals(user.getId());
        }

        // winnerId is a team id for team matches
        if (match.getTeam1() != null && winnerId.equals(match.getTeam1().getId())) {
            return match.getTeam1().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        }
        if (match.getTeam2() != null && winnerId.equals(match.getTeam2().getId())) {
            return match.getTeam2().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        }
        return false;
    }

    private Match getMatchOrThrow(Long matchId) {
        return matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
    }

    public Response.MatchDto mapToDto(Match match) {
        return Response.MatchDto.builder()
                .id(match.getId())
                .game(gameService.mapToDto(match.getGame()))
                .teamMatch(match.isTeamMatch())
                .player1(match.getPlayer1() != null ? userService.mapToProfile(match.getPlayer1()) : null)
                .player2(match.getPlayer2() != null ? userService.mapToProfile(match.getPlayer2()) : null)
                .team1(match.getTeam1() != null ? teamService.mapToDto(match.getTeam1()) : null)
                .team2(match.getTeam2() != null ? teamService.mapToDto(match.getTeam2()) : null)
                .betType(match.getBetType())
                .betDescription(match.getBetDescription())
                .score1(match.getScore1())
                .score2(match.getScore2())
                .winnerId(match.getWinnerId())
                .status(match.getStatus())
                .resultConfirmedByOpponent(match.isResultConfirmedByOpponent())
                .betSettledRequested(match.isBetSettledRequested())
                .betSettledRequestedAt(match.getBetSettledRequestedAt())
                .betSettledConfirmed(match.isBetSettledConfirmed())
                .createdAt(match.getCreatedAt())
                .build();
    }
}
