package com.mentora.backend.responses;

import java.util.List;

import com.mentora.backend.dt.DtUser;

public class BulkMatricularUsuariosResponse {
  private List<DtUser> matriculados;
  private List<String> errors;

  public BulkMatricularUsuariosResponse(List<DtUser> matriculados, List<String> errors) {
    this.matriculados = matriculados;
    this.errors = errors;
  }

    public List<DtUser> getMatriculados() {
    return matriculados;
  }

  public void setMatriculados(List<DtUser> matriculados) {
    this.matriculados = matriculados;
  }

  public List<String> getErrors() {
    return errors;
  }

  public void setErrors(List<String> errors) {
    this.errors = errors;
  }
}
