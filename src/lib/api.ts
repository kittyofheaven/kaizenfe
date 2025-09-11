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
  TimeSlot,
  HealthResponse,
  ApiInfoResponse,
  PaginationParams,
  TimeRangeParams,
  TimeSlotParams,
} from '@/types/api'

const API_BASE_URL = 'http://localhost:3000'
const API_VERSION = '/api/v1'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(
          data.message || 'An error occurred',
          response.status,
          data.errors
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Network error', 0)
    }
  }

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  // Health Check
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health')
  }

  async getApiInfo(): Promise<ApiInfoResponse> {
    return this.request<ApiInfoResponse>(API_VERSION)
  }

  // Users
  async getUsers(params: PaginationParams = {}): Promise<PaginatedResponse<User>> {
    const queryParams = this.buildQueryParams(params)
    return this.request<PaginatedResponse<User>>(`${API_VERSION}/users${queryParams}`)
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`${API_VERSION}/users/${id}`)
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`${API_VERSION}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`${API_VERSION}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`${API_VERSION}/users/${id}`, {
      method: 'DELETE',
    })
  }

  async getUsersByAngkatan(angkatanId: string): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`${API_VERSION}/users/angkatan/${angkatanId}`)
  }

  async getUserByWa(nomorWa: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`${API_VERSION}/users/wa/${nomorWa}`)
  }

  // Communal Bookings
  async getCommunalBookings(params: PaginationParams = {}): Promise<PaginatedResponse<CommunalBooking>> {
    const queryParams = this.buildQueryParams(params)
    return this.request<PaginatedResponse<CommunalBooking>>(`${API_VERSION}/communal${queryParams}`)
  }

  async getCommunalBookingById(id: string): Promise<ApiResponse<CommunalBooking>> {
    return this.request<ApiResponse<CommunalBooking>>(`${API_VERSION}/communal/${id}`)
  }

  async createCommunalBooking(bookingData: CreateCommunalBookingRequest): Promise<ApiResponse<CommunalBooking>> {
    return this.request<ApiResponse<CommunalBooking>>(`${API_VERSION}/communal`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  }

  async updateCommunalBooking(id: string, bookingData: Partial<CreateCommunalBookingRequest>): Promise<ApiResponse<CommunalBooking>> {
    return this.request<ApiResponse<CommunalBooking>>(`${API_VERSION}/communal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    })
  }

  async deleteCommunalBooking(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`${API_VERSION}/communal/${id}`, {
      method: 'DELETE',
    })
  }

  async getCommunalBookingsByResponsible(penanggungJawabId: string): Promise<PaginatedResponse<CommunalBooking>> {
    return this.request<PaginatedResponse<CommunalBooking>>(`${API_VERSION}/communal/penanggung-jawab/${penanggungJawabId}`)
  }

  async getCommunalBookingsByFloor(lantai: string): Promise<PaginatedResponse<CommunalBooking>> {
    return this.request<PaginatedResponse<CommunalBooking>>(`${API_VERSION}/communal/lantai/${lantai}`)
  }

  async getCommunalAvailableSlots(date: string, lantai: string): Promise<ApiResponse<TimeSlot[]>> {
    return this.request<ApiResponse<TimeSlot[]>>(`${API_VERSION}/communal/available-slots/${date}/${lantai}`)
  }

  async getCommunalTimeSlots(params: TimeSlotParams): Promise<ApiResponse<TimeSlot[]>> {
    const queryParams = this.buildQueryParams(params)
    return this.request<ApiResponse<TimeSlot[]>>(`${API_VERSION}/communal/time-slots${queryParams}`)
  }

  // Serbaguna Bookings
  async getSerbagunaBookings(params: PaginationParams = {}): Promise<PaginatedResponse<SerbagunaBooking>> {
    const queryParams = this.buildQueryParams(params)
    return this.request<PaginatedResponse<SerbagunaBooking>>(`${API_VERSION}/serbaguna${queryParams}`)
  }

  async createSerbagunaBooking(bookingData: CreateSerbagunaBookingRequest): Promise<ApiResponse<SerbagunaBooking>> {
    return this.request<ApiResponse<SerbagunaBooking>>(`${API_VERSION}/serbaguna`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  }

  async getSerbagunaAreas(): Promise<ApiResponse<SerbagunaArea[]>> {
    return this.request<ApiResponse<SerbagunaArea[]>>(`${API_VERSION}/serbaguna/areas`)
  }

  async getSerbagunaAvailableSlots(date: string, areaId: string): Promise<ApiResponse<TimeSlot[]>> {
    return this.request<ApiResponse<TimeSlot[]>>(`${API_VERSION}/serbaguna/available-slots/${date}/${areaId}`)
  }

  // Kitchen Bookings
  async getKitchenBookings(params: PaginationParams = {}): Promise<PaginatedResponse<KitchenBooking>> {
    const queryParams = this.buildQueryParams(params)
    return this.request<PaginatedResponse<KitchenBooking>>(`${API_VERSION}/dapur${queryParams}`)
  }

  async createKitchenBooking(bookingData: CreateKitchenBookingRequest): Promise<ApiResponse<KitchenBooking>> {
    return this.request<ApiResponse<KitchenBooking>>(`${API_VERSION}/dapur`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  }

  async getKitchenFacilities(): Promise<ApiResponse<KitchenFacility[]>> {
    return this.request<ApiResponse<KitchenFacility[]>>(`${API_VERSION}/dapur/facilities`)
  }

  async getKitchenTimeSlots(params: TimeSlotParams): Promise<ApiResponse<TimeSlot[]>> {
    const queryParams = this.buildQueryParams(params)
    return this.request<ApiResponse<TimeSlot[]>>(`${API_VERSION}/dapur/time-slots${queryParams}`)
  }

  // Women's Washing Machine Bookings
  async getWomenWashingMachineBookings(params: PaginationParams = {}): Promise<PaginatedResponse<WashingMachineBooking>> {
    const queryParams = this.buildQueryParams(params)
    return this.request<PaginatedResponse<WashingMachineBooking>>(`${API_VERSION}/mesin-cuci-cewe${queryParams}`)
  }

  async createWomenWashingMachineBooking(bookingData: CreateWashingMachineBookingRequest): Promise<ApiResponse<WashingMachineBooking>> {
    return this.request<ApiResponse<WashingMachineBooking>>(`${API_VERSION}/mesin-cuci-cewe`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  }

  async getWomenWashingMachineFacilities(): Promise<ApiResponse<WashingMachineFacility[]>> {
    return this.request<ApiResponse<WashingMachineFacility[]>>(`${API_VERSION}/mesin-cuci-cewe/facilities`)
  }

  // Men's Washing Machine Bookings
  async getMenWashingMachineBookings(params: PaginationParams = {}): Promise<PaginatedResponse<WashingMachineBooking>> {
    const queryParams = this.buildQueryParams(params)
    return this.request<PaginatedResponse<WashingMachineBooking>>(`${API_VERSION}/mesin-cuci-cowo${queryParams}`)
  }

  async createMenWashingMachineBooking(bookingData: CreateWashingMachineBookingRequest): Promise<ApiResponse<WashingMachineBooking>> {
    return this.request<ApiResponse<WashingMachineBooking>>(`${API_VERSION}/mesin-cuci-cowo`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  }

  async getMenWashingMachineFacilities(): Promise<ApiResponse<WashingMachineFacility[]>> {
    return this.request<ApiResponse<WashingMachineFacility[]>>(`${API_VERSION}/mesin-cuci-cowo/facilities`)
  }
}

export const apiClient = new ApiClient()
export { ApiError }
