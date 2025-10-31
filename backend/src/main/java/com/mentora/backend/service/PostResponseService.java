package com.mentora.backend.service;

import com.mentora.backend.dt.DtPostResponse;
import com.mentora.backend.model.Post;
import com.mentora.backend.model.PostResponse;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.PostRepository;
import com.mentora.backend.repository.PostResponseRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostResponseService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostResponseRepository postResponseRepository;

    public PostResponseService(PostRepository postRepository, UserRepository userRepository,
                               PostResponseRepository postResponseRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postResponseRepository = postResponseRepository;
    }

    public DtPostResponse createResponse(Long postId, String authorCi, String message) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));
        User author = userRepository.findById(authorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        PostResponse response = new PostResponse();
        response.setPost(post);
        response.setAuthor(author);
        response.setMessage(message);
        response.setCreatedDate(java.time.LocalDateTime.now());

        PostResponse saved = postResponseRepository.save(response);
        return toDto(saved);
    }

    public List<DtPostResponse> getResponsesForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        return postResponseRepository.findAllByPost(post)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private DtPostResponse toDto(PostResponse response) {
        DtPostResponse dto = new DtPostResponse();
        dto.setId(response.getId());
        dto.setMessage(response.getMessage());
        dto.setCreatedDate(response.getCreatedDate());
        dto.setAuthorCi(response.getAuthor().getCi());
        dto.setAuthorName(response.getAuthor().getName());
        dto.setPostId(response.getPost().getId());
        return dto;
    }
}
