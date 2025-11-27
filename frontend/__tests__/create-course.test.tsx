import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CreateCourseForm from "../app/(logged)/admin/courses/new/components/create-course-form";
import { userController } from "@/controllers/userController";
import { courseController } from "@/controllers/courseController";
import { useAuth } from "@/hooks/useAuth";

jest.mock("@/hooks/useAuth");
jest.mock("@/controllers/userController");
jest.mock("@/controllers/courseController");

describe("CreateCourseForm", () => {
  const mockAccessToken = "TOKEN123";

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      accessToken: mockAccessToken,
    });

    (userController.getUsers as jest.Mock).mockResolvedValue({
      data: [
        { ci: "111", name: "Profesor Uno" },
        { ci: "222", name: "Profesor Dos" }
      ]
    });
  });

  const setup = async () => {
    render(<CreateCourseForm />);
    await waitFor(() => {
      expect(screen.getByText("Profesor Uno (111)")).toBeInTheDocument();
    });
  };

  test("muestra validaciones al enviar vacío", async () => {
    await setup();

    fireEvent.click(screen.getByRole("button", { name: /crear curso/i }));

    expect(await screen.findByText("El ID del curso es requerido")).toBeInTheDocument();
  });

  test("permite completar campos, seleccionar profesor y enviar", async () => {
    await setup();

    fireEvent.change(screen.getByLabelText(/ID del Curso/i), {
      target: { value: "MAT101" }
    });

    fireEvent.change(screen.getByLabelText(/Nombre del Curso/i), {
      target: { value: "Matemática I" }
    });

    fireEvent.click(screen.getByText("Profesor Uno (111)"));

    (courseController.createCourse as jest.Mock).mockResolvedValue({
      success: true,
      message: "Curso creado exitosamente"
    });

    fireEvent.click(screen.getByRole("button", { name: /crear curso/i }));

    expect(await screen.findByText("Curso creado exitosamente")).toBeInTheDocument();

    expect(courseController.createCourse).toHaveBeenCalledWith(
      {
        id: "MAT101",
        name: "Matemática I",
        professorsCis: ["111"]
      },
      mockAccessToken
    );
  });

  test("muestra error cuando la API devuelve error", async () => {
    await setup();

    fireEvent.change(screen.getByLabelText(/ID del Curso/i), {
      target: { value: "MAT101" }
    });

    fireEvent.change(screen.getByLabelText(/Nombre del Curso/i), {
      target: { value: "Matemática I" }
    });

    fireEvent.click(screen.getByText("Profesor Uno (111)"));

    (courseController.createCourse as jest.Mock).mockResolvedValue({
      success: false,
      message: "Error creando curso"
    });

    fireEvent.click(screen.getByRole("button", { name: /crear curso/i }));

    expect(await screen.findByText("Error creando curso")).toBeInTheDocument();
  });
});
