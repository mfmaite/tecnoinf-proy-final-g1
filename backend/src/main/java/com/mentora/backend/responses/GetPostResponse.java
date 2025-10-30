package com.mentora.backend.responses;

import com.mentora.backend.dt.DtForum;
import com.mentora.backend.dt.DtPost;

public class GetPostResponse {
  private DtForum forum;
  private DtPost post;

  public GetPostResponse() {}

  public GetPostResponse(DtForum forum, DtPost post) {
    this.forum = forum;
    this.post = post;
  }

  public DtForum getForum() { return forum; }
  public void setForum(DtForum forum) { this.forum = forum; }

  public DtPost getPost() { return post; }
  public void setPost(DtPost post) { this.post = post; }
}


