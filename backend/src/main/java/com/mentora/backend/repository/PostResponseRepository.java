package com.mentora.backend.repository;

import com.mentora.backend.model.PostResponse;
import com.mentora.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostResponseRepository extends JpaRepository<PostResponse, String> {
    List<PostResponse> findAllByPost(Post post);
}
