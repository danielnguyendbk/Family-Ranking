package com.familyranking.repository;

import com.familyranking.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import com.familyranking.entity.User;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByGame_Id(Long gameId);
    List<Team> findByMembersContaining(User user);
}
