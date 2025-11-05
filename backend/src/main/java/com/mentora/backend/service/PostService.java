package com.mentora.backend.service;

import com.mentora.backend.dt.DtPost;
import com.mentora.backend.dt.DtPostResponse;
import com.mentora.backend.dt.DtForum;
import com.mentora.backend.responses.GetSinglePostResponse;
import com.mentora.backend.model.*;
import com.mentora.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostResponseRepository postResponseRepository;

    public PostService(
            PostRepository postRepository,
            UserRepository userRepository,
            PostResponseRepository postResponseRepository
    ) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postResponseRepository = postResponseRepository;
    }

    private DtPost getDtPost(Post post) {
        return new DtPost(
            post.getId(),
            post.getAuthor().getCi(),
            post.getAuthor().getName(),
            post.getAuthor().getPictureUrl(),
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

    public void deleteAllResponsePosts(Post post) {
        List<PostResponse> responses = postResponseRepository.findAllByPost(post);
        postResponseRepository.deleteAll(responses);
    }

    public void deletePost(Long postId, String userCi) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        if (!post.getAuthor().getCi().equals(userCi))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permisos para eliminar este post");

        deleteAllResponsePosts(post);
        postRepository.delete(post);
    }

    public DtPostResponse createResponse(Long postId, String authorCi, String message) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        if (post.getForum().getType() == ForumType.ANNOUNCEMENTS)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No es posible responder a un post de anuncios");

        User author = userRepository.findById(authorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        PostResponse response = new PostResponse(
            message,
            author,
            post
        );

        PostResponse saved = postResponseRepository.save(response);

        return getDtPostResponse(saved);
    }

    public List<DtPostResponse> getResponsesForPost(Post post) {
        return postResponseRepository.findAllByPost(post)
                .stream()
                .map(this::getDtPostResponse)
                .collect(Collectors.toList());
    }

    public GetSinglePostResponse getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        Forum forum = post.getForum();

        return new GetSinglePostResponse(
            getDtForum(forum),
            getDtPost(post),
            getResponsesForPost(post)
        );
    }

    private DtForum getDtForum(Forum forum) {
        return new DtForum(forum.getId().toString(), forum.getType().name(), forum.getCourse().getId());
    }

    private DtPostResponse getDtPostResponse(PostResponse response) {
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
