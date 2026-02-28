export interface AuthToken {
  token: string;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  totalPoints: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: string;
}

export interface ProfileUpdateRequest {
  avatar?: string;
  username?: string;
}

export interface GameDto {
  id: number;
  name: string;
  description: string | null;
  winPoint: number;
  drawPoint: number;
  lossPoint: number;
  teamGame: boolean;
}

export interface TeamDto {
  id: number;
  name: string;
  gameId: number;
  members: UserProfile[];
}

export type BetType = 'FRIENDLY' | 'LY_NUOC' | 'OTHER';
export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface MatchDto {
  id: number;
  game: GameDto;
  teamMatch: boolean;
  player1: UserProfile | null;
  player2: UserProfile | null;
  team1: TeamDto | null;
  team2: TeamDto | null;
  betType: BetType;
  betDescription: string | null;
  score1: number | null;
  score2: number | null;
  winnerId: number | null;
  status: MatchStatus;
  resultConfirmedByOpponent: boolean;
  betSettledRequested: boolean;
  betSettledConfirmed: boolean;
  createdAt: string;
}

export interface MatchRequest {
  gameId: number;
  teamMatch: boolean;
  opponentId?: number;
  team1Id?: number;
  team2Id?: number;
  betType: BetType;
  betDescription?: string;
  score1?: number;
  score2?: number;
  winnerId?: number;
}

export interface RankingEntry {
  rank: number;
  userId: number;
  username: string;
  avatar: string | null;
  points: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export type ValidationErrors = Record<string, string>;

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}

