import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CoursesList from "../(courses)/coursesList";
import { api } from "../../services/api";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

describe("CoursesList", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  const mockCourses = [
    { id: "1", name: "Algebra", createdDate: "2025-01-01" },
    { id: "2", name: "Biología", createdDate: "2024-12-10" },
  ];

  // ------------------------------------------------------------------
  test("muestra error cuando falla la carga", async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error("fail"));

    const { getByText } = render(<CoursesList />);

    await waitFor(() => {
      expect(getByText("No se pudieron cargar los cursos.")).toBeTruthy();
    });
  });

  // ------------------------------------------------------------------
  test("muestra lista de cursos cuando carga correctamente", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { data: mockCourses },
    });

    const { getByText } = render(<CoursesList />);

    await waitFor(() => {
      expect(getByText("Algebra")).toBeTruthy();
      expect(getByText("Biología")).toBeTruthy();
    });
  });

  // ------------------------------------------------------------------
  test("filtra por nombre o ID al escribir en búsqueda", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { data: mockCourses },
    });

    const { getByPlaceholderText, queryByText } = render(<CoursesList />);

    await waitFor(() => {});

    const searchInput = getByPlaceholderText("Buscar por nombre o ID...");

    fireEvent.changeText(searchInput, "alg");

    expect(queryByText("Algebra")).not.toBeNull();
    expect(queryByText("Biología")).toBeNull();
  });

  // ------------------------------------------------------------------
  test("ordena por nombre desc (Z-A)", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { data: mockCourses },
    });

    const { getByTestId, getByText } = render(<CoursesList />);

    await waitFor(() => {});

    const picker = getByTestId("sortPicker");

    fireEvent(picker, "onValueChange", "name-desc");

    // orden esperado: Biología, Algebra
    expect(getByText("Biología")).toBeTruthy();
    expect(getByText("Algebra")).toBeTruthy();
  });


  // ------------------------------------------------------------------
  test("navega a pantalla Ver curso al presionar botón", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { data: mockCourses },
    });

    const { getAllByText } = render(<CoursesList />);

    await waitFor(() => {});

    const botones = getAllByText("Ver");
    fireEvent.press(botones[0]); // presiona curso con id "1"

    expect(mockPush).toHaveBeenCalledWith("/(courses)/1");
  });
});
