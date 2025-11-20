import {
  ApiResponse,
  PaginatedResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  CommunalBooking,
  CreateCommunalBookingRequest,
  SerbagunaBooking,
  CreateSerbagunaBookingRequest,
  SerbagunaArea,
  KitchenBooking,
  CreateKitchenBookingRequest,
  KitchenFacility,
  WashingMachineBooking,
  CreateWashingMachineBookingRequest,
  WashingMachineFacility,
  CWSBooking,
  CreateCWSBookingRequest,
  TheaterBooking,
  CreateTheaterBookingRequest,
  TimeSlot,
  HealthResponse,
  ApiInfoResponse,
  PaginationParams,
  TimeSlotParams,
  LoginRequest,
  LoginResponse,
  UpdatePasswordRequest,
} from "@/types/api";

// Use empty string for base URL to use Next.js proxy
const API_BASE_URL = "";
const API_VERSION = "/api/v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

type QueryParamValue = string | number | boolean | Date | null | undefined;
type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

const extractErrorMessage = (data: unknown, fallback: string): string => {
  if (isRecord(data) && typeof data.message === "string") {
    return data.message;
  }

  if (typeof data === "string" && data.length > 0) {
    return data;
  }

  return fallback;
};

const extractErrorDetails = (data: unknown): string[] | undefined => {
  if (isRecord(data) && Array.isArray(data.errors)) {
    return data.errors.filter(
      (error): error is string => typeof error === "string"
    );
  }

  return undefined;
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add existing headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Add JWT token to headers if available and not skipping auth
    if (!skipAuth && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const responseText = await response.text();
      const trimmedResponse = responseText.trim();

      let data: unknown = null;

      if (trimmedResponse) {
        try {
          data = JSON.parse(trimmedResponse);
        } catch (parseError) {
          const contentType = response.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            console.error("Failed to parse JSON response:", parseError);
          }
          data = trimmedResponse;
        }
      }

      if (!response.ok) {
        // Handle token expiry/invalid token (401 Unauthorized)
        if (response.status === 401 && !skipAuth) {
          // Clear invalid token from localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }

          // Redirect to login page
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          throw new ApiError(
            extractErrorMessage(
              data,
              "Session expired. Please login again."
            ),
            response.status
          );
        }

        throw new ApiError(
          extractErrorMessage(data, "An error occurred"),
          response.status,
          extractErrorDetails(data)
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Network error", 0);
    }
  }

    private buildQueryParams(params: QueryParams): string {
      const searchParams = new URLSearchParams();

      const appendValue = (key: string, rawValue: QueryParamValue) => {
        if (rawValue === undefined || rawValue === null) {
          return;
        }

        const value =
          rawValue instanceof Date ? rawValue.toISOString() : rawValue.toString();
        searchParams.append(key, value);
      };

      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => appendValue(key, item));
        } else {
          appendValue(key, value);
        }
      });

      const queryString = searchParams.toString();
      return queryString ? `?${queryString}` : "";
    }

  // Health Check
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/api/health", {}, true); // Skip auth for health check
  }

  async getApiInfo(): Promise<ApiInfoResponse> {
    return this.request<ApiInfoResponse>(API_VERSION, {}, true); // Skip auth for API info
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<ApiResponse<LoginResponse>>(
      `${API_VERSION}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
      true // Skip auth for login
    );
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`${API_VERSION}/auth/profile`);
  }

  async updatePassword(
    passwordData: UpdatePasswordRequest
  ): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(
      `${API_VERSION}/auth/update-password`,
      {
        method: "PUT",
        body: JSON.stringify(passwordData),
      }
    );
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`${API_VERSION}/auth/logout`, {
      method: "POST",
    });
  }

  // Users
  async getUsers(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<User>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<PaginatedResponse<User>>(
      `${API_VERSION}/users${queryParams}`
    );
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`${API_VERSION}/users/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`${API_VERSION}/users`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(
    id: string,
    userData: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`${API_VERSION}/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`${API_VERSION}/users/${id}`, {
      method: "DELETE",
    });
  }

  async getUsersByAngkatan(
    angkatanId: string
  ): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(
      `${API_VERSION}/users/angkatan/${angkatanId}`
    );
  }

  async getUserByWa(nomorWa: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(
      `${API_VERSION}/users/wa/${nomorWa}`
    );
  }

  // Communal Bookings
  async getCommunalBookings(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<CommunalBooking>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<PaginatedResponse<CommunalBooking>>(
      `${API_VERSION}/communal${queryParams}`
    );
  }

  async getCommunalBookingById(
    id: string
  ): Promise<ApiResponse<CommunalBooking>> {
    return this.request<ApiResponse<CommunalBooking>>(
      `${API_VERSION}/communal/${id}`
    );
  }

  async createCommunalBooking(
    bookingData: CreateCommunalBookingRequest
  ): Promise<ApiResponse<CommunalBooking>> {
    return this.request<ApiResponse<CommunalBooking>>(
      `${API_VERSION}/communal`,
      {
        method: "POST",
        body: JSON.stringify(bookingData),
      }
    );
  }

  async updateCommunalBooking(
    id: string,
    bookingData: Partial<CreateCommunalBookingRequest>
  ): Promise<ApiResponse<CommunalBooking>> {
    return this.request<ApiResponse<CommunalBooking>>(
      `${API_VERSION}/communal/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(bookingData),
      }
    );
  }

  async deleteCommunalBooking(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`${API_VERSION}/communal/${id}`, {
      method: "DELETE",
    });
  }

  async getCommunalBookingsByResponsible(
    penanggungJawabId: string
  ): Promise<PaginatedResponse<CommunalBooking>> {
    return this.request<PaginatedResponse<CommunalBooking>>(
      `${API_VERSION}/communal/penanggung-jawab/${penanggungJawabId}`
    );
  }

  async getCommunalBookingsByFloor(
    lantai: string
  ): Promise<PaginatedResponse<CommunalBooking>> {
    return this.request<PaginatedResponse<CommunalBooking>>(
      `${API_VERSION}/communal/lantai/${lantai}`
    );
  }

  async getCommunalAvailableSlots(
    date: string,
    lantai: string
  ): Promise<ApiResponse<TimeSlot[]>> {
    return this.request<ApiResponse<TimeSlot[]>>(
      `${API_VERSION}/communal/available-slots/${date}/${lantai}`
    );
  }

  async getCommunalTimeSlots(
    params: TimeSlotParams
  ): Promise<ApiResponse<TimeSlot[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<TimeSlot[]>>(
      `${API_VERSION}/communal/time-slots${queryParams}`
    );
  }

  // Serbaguna Bookings
  async getSerbagunaBookings(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<SerbagunaBooking>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<PaginatedResponse<SerbagunaBooking>>(
      `${API_VERSION}/serbaguna${queryParams}`
    );
  }

  async createSerbagunaBooking(
    bookingData: CreateSerbagunaBookingRequest
  ): Promise<ApiResponse<SerbagunaBooking>> {
    return this.request<ApiResponse<SerbagunaBooking>>(
      `${API_VERSION}/serbaguna`,
      {
        method: "POST",
        body: JSON.stringify(bookingData),
      }
    );
  }

  async getSerbagunaAreas(): Promise<ApiResponse<SerbagunaArea[]>> {
    return this.request<ApiResponse<SerbagunaArea[]>>(
      `${API_VERSION}/serbaguna/areas`
    );
  }

  async getSerbagunaAvailableSlots(
    date: string,
    areaId: string
  ): Promise<ApiResponse<TimeSlot[]>> {
    return this.request<ApiResponse<TimeSlot[]>>(
      `${API_VERSION}/serbaguna/available-slots/${date}/${areaId}`
    );
  }

  async getSerbagunaTimeSlots(
    params: TimeSlotParams & { areaId?: string }
  ): Promise<ApiResponse<TimeSlot[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<TimeSlot[]>>(
      `${API_VERSION}/serbaguna/time-slots${queryParams}`
    );
  }

  // Kitchen Bookings
  async getKitchenBookings(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<KitchenBooking>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<PaginatedResponse<KitchenBooking>>(
      `${API_VERSION}/dapur${queryParams}`
    );
  }

  async createKitchenBooking(
    bookingData: CreateKitchenBookingRequest
  ): Promise<ApiResponse<KitchenBooking>> {
    return this.request<ApiResponse<KitchenBooking>>(`${API_VERSION}/dapur`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getKitchenFacilities(): Promise<ApiResponse<KitchenFacility[]>> {
    return this.request<ApiResponse<KitchenFacility[]>>(
      `${API_VERSION}/dapur/facilities`
    );
  }

  async getKitchenTimeSlots(
    params: TimeSlotParams & { facilityId?: string }
  ): Promise<ApiResponse<TimeSlot[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<TimeSlot[]>>(
      `${API_VERSION}/dapur/time-slots${queryParams}`
    );
  }

  // Women's Washing Machine Bookings
  async getWomenWashingMachineBookings(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<WashingMachineBooking>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<PaginatedResponse<WashingMachineBooking>>(
      `${API_VERSION}/mesin-cuci-cewe${queryParams}`
    );
  }

  async createWomenWashingMachineBooking(
    bookingData: CreateWashingMachineBookingRequest
  ): Promise<ApiResponse<WashingMachineBooking>> {
    return this.request<ApiResponse<WashingMachineBooking>>(
      `${API_VERSION}/mesin-cuci-cewe`,
      {
        method: "POST",
        body: JSON.stringify(bookingData),
      }
    );
  }

  async getWomenWashingMachineFacilities(): Promise<
    ApiResponse<WashingMachineFacility[]>
  > {
    return this.request<ApiResponse<WashingMachineFacility[]>>(
      `${API_VERSION}/mesin-cuci-cewe/facilities`
    );
  }

  // Men's Washing Machine Bookings
  async getMenWashingMachineBookings(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<WashingMachineBooking>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<PaginatedResponse<WashingMachineBooking>>(
      `${API_VERSION}/mesin-cuci-cowo${queryParams}`
    );
  }

  async createMenWashingMachineBooking(
    bookingData: CreateWashingMachineBookingRequest
  ): Promise<ApiResponse<WashingMachineBooking>> {
    return this.request<ApiResponse<WashingMachineBooking>>(
      `${API_VERSION}/mesin-cuci-cowo`,
      {
        method: "POST",
        body: JSON.stringify(bookingData),
      }
    );
  }

  async getMenWashingMachineFacilities(): Promise<
    ApiResponse<WashingMachineFacility[]>
  > {
    return this.request<ApiResponse<WashingMachineFacility[]>>(
      `${API_VERSION}/mesin-cuci-cowo/facilities`
    );
  }

  // CWS (Community Work Space) Bookings
  async getCWSBookings(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<CWSBooking>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<PaginatedResponse<CWSBooking>>(
      `${API_VERSION}/cws${queryParams}`
    );
  }

  async createCWSBooking(
    bookingData: CreateCWSBookingRequest
  ): Promise<ApiResponse<CWSBooking>> {
    return this.request<ApiResponse<CWSBooking>>(`${API_VERSION}/cws`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async updateCWSBooking(
    id: string,
    bookingData: Partial<CreateCWSBookingRequest>
  ): Promise<ApiResponse<CWSBooking>> {
    return this.request<ApiResponse<CWSBooking>>(`${API_VERSION}/cws/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    });
  }

  async deleteCWSBooking(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`${API_VERSION}/cws/${id}`, {
      method: "DELETE",
    });
  }

  async getCWSBookingsByResponsiblePerson(
    penanggungJawabId: string
  ): Promise<ApiResponse<CWSBooking[]>> {
    return this.request<ApiResponse<CWSBooking[]>>(
      `${API_VERSION}/cws/penanggung-jawab/${penanggungJawabId}`
    );
  }

  async getCWSBookingsByDate(date: string): Promise<ApiResponse<CWSBooking[]>> {
    return this.request<ApiResponse<CWSBooking[]>>(
      `${API_VERSION}/cws/date/${date}`
    );
  }

  // Theater Bookings
  async getTheaterBookings(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<TheaterBooking>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<PaginatedResponse<TheaterBooking>>(
      `${API_VERSION}/theater${queryParams}`
    );
  }

  async createTheaterBooking(
    bookingData: CreateTheaterBookingRequest
  ): Promise<ApiResponse<TheaterBooking>> {
    return this.request<ApiResponse<TheaterBooking>>(`${API_VERSION}/theater`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async updateTheaterBooking(
    id: string,
    bookingData: Partial<CreateTheaterBookingRequest>
  ): Promise<ApiResponse<TheaterBooking>> {
    return this.request<ApiResponse<TheaterBooking>>(
      `${API_VERSION}/theater/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(bookingData),
      }
    );
  }

  async deleteTheaterBooking(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`${API_VERSION}/theater/${id}`, {
      method: "DELETE",
    });
  }

  async getTheaterBookingsByResponsiblePerson(
    penanggungJawabId: string
  ): Promise<ApiResponse<TheaterBooking[]>> {
    return this.request<ApiResponse<TheaterBooking[]>>(
      `${API_VERSION}/theater/penanggung-jawab/${penanggungJawabId}`
    );
  }

  async getTheaterTimeSlots(
    params: TimeSlotParams
  ): Promise<ApiResponse<TimeSlot[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<TimeSlot[]>>(
      `${API_VERSION}/theater/time-slots${queryParams}`
    );
  }

  async getTheaterTimeSuggestions(
    params: TimeSlotParams
  ): Promise<ApiResponse<TimeSlot[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.request<ApiResponse<TimeSlot[]>>(
      `${API_VERSION}/theater/time-suggestions${queryParams}`
    );
  }
}

export const apiClient = new ApiClient();
export { ApiError };
