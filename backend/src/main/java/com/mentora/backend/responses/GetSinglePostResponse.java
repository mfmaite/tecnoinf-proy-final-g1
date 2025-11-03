package com.mentora.backend.responses;

import com.mentora.backend.dt.DtForum;
import com.mentora.backend.dt.DtPost;
import com.mentora.backend.dt.DtPostResponse;
import java.util.List;

public class GetSinglePostResponse {
  private DtForum forum;
  private DtPost post;
  private List<DtPostResponse> responses;

  public GetSinglePostResponse() {}

  public GetSinglePostResponse(DtForum forum, DtPost post, List<DtPostResponse> responses) {
    this.forum = forum;
    this.post = post;
    this.responses = responses;
  }

  public DtForum getForum() { return forum; }
  public void setForum(DtForum forum) { this.forum = forum; }

  public DtPost getPost() { return post; }
  public void setPost(DtPost post) { this.post = post; }

  public List<DtPostResponse> getResponses() { return responses; }
  public void setResponses(List<DtPostResponse> responses) { this.responses = responses; }
}


