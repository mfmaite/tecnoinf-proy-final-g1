package com.mentora.backend.responses;

import com.mentora.backend.dt.DtForum;
import com.mentora.backend.dt.DtPost;
import java.util.List;

public class GetForumResponse {
  private DtForum forum;
  private List<DtPost> posts;

  public GetForumResponse() {}

  public GetForumResponse(DtForum forum, List<DtPost> posts) {
    this.forum = forum;
    this.posts = posts;
  }

  public DtForum getForum() { return forum; }
  public void setForum(DtForum forum) { this.forum = forum; }

  public List<DtPost> getPosts() { return posts; }
  public void setPosts(List<DtPost> posts) { this.posts = posts; }
}
