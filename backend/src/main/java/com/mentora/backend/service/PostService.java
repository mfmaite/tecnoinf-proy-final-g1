package com.mentora.backend.service;

import com.mentora.backend.dt.DtPost;
import com.mentora.backend.model.*;
import com.mentora.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(
            PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    private DtPost getDtPost(Post post) {
        return new DtPost(
            post.getId(),
            post.getAuthor().getCi(),
            post.getAuthor().getName(),
            post.getAuthor().getPictureFileName(),
            post.getMessage(),
            post.getCreatedDate()
        );
    }

    public DtPost editPost(Long postId, String userCi, String message) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        if (!post.getAuthor().getCi().equals(userCi))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permisos para editar este post");

        post.setMessage(message);
        Post updated = postRepository.save(post);

        return getDtPost(updated);
    }

    public void deletePost(Long postId, String userCi) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        if (!post.getAuthor().getCi().equals(userCi))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permisos para eliminar este post");

        postRepository.delete(post);
    }


}
