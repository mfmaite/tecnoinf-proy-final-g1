import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CoursesListPage from "../app/(logged)/courses/page";
import { courseController } from "@/controllers/courseController";

// 🧩 Mocks de dependencias externas

jest.mock('@/public/assets/icons/mentora-logo.svg', () => 'MockedLogo');
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: "fake-token" })
}));
jest.mock('@/controllers/courseController', () => ({
  courseController: {
    getCourses: jest.fn()
  }
}));

describe("CoursesListPage", () => {
    const mockCourses = [
        { id: "CURSO1", name: "NOMBRE CURSO 1", createdDate: new Date().toISOString() },
        { id: "CURSO2", name: "NOMBRE CURSO 2", createdDate: new Date().toISOString() }
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("muestra mensaje de carga inicial", () => {
        courseController.getCourses.mockImplementation(() => new Promise(() => {}));
        
        render(<CoursesListPage />);

        expect(screen.getByText(/cargando cursos/i)).toBeInTheDocument();
    });

    test("muestra cursos cuando la API responde OK", async () => {
        courseController.getCourses.mockResolvedValue({ data: mockCourses });

        render(<CoursesListPage />);

        expect(await screen.findByText("NOMBRE CURSO 1")).toBeInTheDocument();
        expect(await screen.findByText("NOMBRE CURSO 2")).toBeInTheDocument();
    });

    test("muestra error si la API falla", async () => {
        courseController.getCourses.mockRejectedValue(new Error("fail"));

        render(<CoursesListPage />);

        expect(await screen.findByText(/fail/i)).toBeInTheDocument();
    });


    test("filtra cursos por nombre", async () => {
        courseController.getCourses.mockResolvedValue({ data: mockCourses });

        render(<CoursesListPage />);

        await userEvent.type(await screen.findByLabelText(/buscar/i), "NOMBRE CURSO 1");

        expect(screen.getByText("NOMBRE CURSO 1")).toBeInTheDocument();
        expect(screen.queryByText("NOMBRE CURSO 2")).not.toBeInTheDocument();
    });

    test("muestra mensaje si no coincide ningún curso", async () => {
        courseController.getCourses.mockResolvedValue({ data: mockCourses });

        render(<CoursesListPage />);

        await userEvent.type(await screen.findByLabelText(/buscar/i), "zzz");

        expect(
        screen.getByText(/no se encontraron cursos/i)
        ).toBeInTheDocument();
    });

    test("muestra mensaje cuando no hay cursos registrados", async () => {
        courseController.getCourses.mockResolvedValue({ data: [] });

        render(<CoursesListPage />);

        expect(await screen.findByText(/no hay cursos registrados/i)).toBeInTheDocument();
    });

    test("manejo del link a vista de curso", async () => {
        courseController.getCourses.mockResolvedValue({ data: mockCourses });

        render(<CoursesListPage />);

        const row = await screen.findByText("CURSO1");
        const link = within(row.closest("tr")!).getByRole("link");

        expect(link).toHaveAttribute("href", "/courses/CURSO1");
    });

});

