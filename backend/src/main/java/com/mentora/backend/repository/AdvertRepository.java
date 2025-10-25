package com.mentora.backend.repository;

import com.mentora.backend.model.Advert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdvertRepository extends JpaRepository<Advert, String> {

    List<Advert> findByForumIdOrderByCreatedAtDesc(String forumId);

}
