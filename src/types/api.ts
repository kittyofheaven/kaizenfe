// Base API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message: string
}

// User Types
export interface User {
  id: string
  idAngkatan: string | null
  namaLengkap: string
  namaPanggilan: string
  nomorWa: string
  createdAt: string
  updatedAt: string
  angkatan?: {
    id: string
    namaAngkatan: string
  } | null
}

export interface CreateUserRequest {
  idAngkatan: string
  namaLengkap: string
  namaPanggilan: string
  nomorWa: string
}

export interface UpdateUserRequest {
  idAngkatan?: string
  namaLengkap?: string
  namaPanggilan?: string
  nomorWa?: string
}

// Communal Booking Types
export interface CommunalBooking {
  id: string
  idPenanggungJawab: string
  waktuMulai: string
  waktuBerakhir: string
  jumlahPengguna: string
  lantai: string
  keterangan: string
  isDone: boolean
  createdAt: string
  updatedAt: string
  penanggungJawab: {
    id: string
    namaLengkap: string
    namaPanggilan: string
    nomorWa: string
  }
}

export interface CreateCommunalBookingRequest {
  idPenanggungJawab: string
  waktuMulai: string
  waktuBerakhir: string
  jumlahPengguna: string
  lantai: string
  keterangan: string
  isDone: boolean
}

// Serbaguna Booking Types
export interface SerbagunaArea {
  id: string
  namaArea: string
}

export interface SerbagunaBooking {
  id: string
  idPenanggungJawab: string
  idArea: string
  waktuMulai: string
  waktuBerakhir: string
  jumlahPengguna: string
  keterangan: string
  isDone: boolean
  createdAt: string
  updatedAt: string
  penanggungJawab: {
    id: string
    namaLengkap: string
    namaPanggilan: string
    nomorWa: string
  }
  area?: SerbagunaArea
}

export interface CreateSerbagunaBookingRequest {
  idPenanggungJawab: string
  idArea: string
  waktuMulai: string
  waktuBerakhir: string
  jumlahPengguna: string
  keterangan: string
  isDone: boolean
}

// Kitchen Booking Types
export interface KitchenFacility {
  id: string
  fasilitas: string
}

export interface KitchenBooking {
  id: string
  idFasilitas: string
  idPeminjam: string
  waktuMulai: string
  waktuBerakhir: string
  pinjamPeralatan: boolean
  createdAt: string
  updatedAt: string
  peminjam: {
    id: string
    namaLengkap: string
    namaPanggilan: string
    nomorWa: string
  }
  fasilitas: KitchenFacility
}

export interface CreateKitchenBookingRequest {
  idFasilitas: string
  idPeminjam: string
  waktuMulai: string
  waktuBerakhir: string
  pinjamPeralatan: boolean
}

// Washing Machine Types
export interface WashingMachineFacility {
  id: string
  nama: string
}

export interface WashingMachineBooking {
  id: string
  idFasilitas: string
  idPeminjam: string
  waktuMulai: string
  waktuBerakhir: string
  createdAt: string
  updatedAt: string
  peminjam: {
    id: string
    namaLengkap: string
    namaPanggilan: string
    nomorWa: string
  }
  fasilitas: WashingMachineFacility
}

export interface CreateWashingMachineBookingRequest {
  idFasilitas: string
  idPeminjam: string
  waktuMulai: string
  waktuBerakhir: string
}

// Time Slot Types
export interface TimeSlot {
  waktuMulai: string
  waktuBerakhir: string
  display?: string
  available?: boolean
}

// Health Check Types
export interface HealthResponse {
  success: boolean
  message: string
  timestamp: string
  version: string
}

export interface ApiInfoResponse {
  success: boolean
  message: string
  version: string
  documentation: string
  endpoints: {
    users: string
    communal: string
    serbaguna: string
    mesinCuciCewe: string
    mesinCuciCowo: string
    dapur: string
  }
}

// Query Parameters
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface TimeRangeParams {
  startTime: string
  endTime: string
}

export interface TimeSlotParams {
  date: string
  facilityId?: string
}
