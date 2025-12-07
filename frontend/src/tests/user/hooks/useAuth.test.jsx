import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../../context/AuthContext";

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should throw error when used outside AuthProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    console.error.mockRestore();
  });

  it("should initialize with null user", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it("should login user", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.login("token123", { id: "1", email: "test@test.com" });
    });

    expect(result.current.user).toEqual({ id: "1", email: "test@test.com" });
    expect(localStorage.getItem("token")).toBe("token123");
  });

  it("should logout user", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.login("token123", { id: "1", email: "test@test.com" });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should update user", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.login("token123", { id: "1", name: "John" });
    });

    act(() => {
      result.current.updateUser({ name: "Jane" });
    });

    expect(result.current.user.name).toBe("Jane");
  });

  it("should return token", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.login("token123", { id: "1" });
    });

    expect(result.current.getToken()).toBe("token123");
  });

  it("should check authentication", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isAuthenticated()).toBe(false);

    act(() => {
      result.current.login("token123", { id: "1" });
    });

    expect(result.current.isAuthenticated()).toBe(true);
  });
});
