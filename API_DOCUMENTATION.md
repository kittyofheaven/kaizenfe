# Kaizen API Documentation

## 📋 Daftar Isi

- [Informasi Umum](#informasi-umum)
- [Base URL & Authentication](#base-url--authentication)
- [Format Response](#format-response)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Users Management](#users-management)
  - [Communal Room Booking](#communal-room-booking)
  - [Serbaguna Area Booking](#serbaguna-area-booking)
  - [Kitchen Booking](#kitchen-booking)
  - [Women's Washing Machine Booking](#womens-washing-machine-booking)
  - [Men's Washing Machine Booking](#mens-washing-machine-booking)
- [Validasi Waktu](#validasi-waktu)
- [Contoh Penggunaan](#contoh-penggunaan)

---

## 📝 Informasi Umum

**Kaizen API** adalah sistem booking fasilitas yang memungkinkan pengguna untuk melakukan reservasi berbagai fasilitas seperti ruang komunal, area serbaguna, dapur, dan mesin cuci.

### Teknologi Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL dengan Prisma ORM
- **Documentation**: Swagger/OpenAPI 3.0

### Fitur Utama

- ✅ Manajemen pengguna
- 🏢 Booking ruang komunal
- 🎯 Booking area serbaguna
- 🍳 Booking fasilitas dapur
- 👕 Booking mesin cuci (terpisah untuk pria dan wanita)
- ⏰ Validasi slot waktu otomatis
- 📄 Pagination untuk semua list data
- 🔍 Filter berdasarkan berbagai kriteria

---

## 🌐 Base URL & Authentication

### Base URL

```
http://localhost:3000
```

### API Version

Semua endpoint menggunakan prefix:

```
/api/v1
```

### Authentication

Saat ini API tidak menggunakan authentication. Semua endpoint dapat diakses langsung.

### Swagger Documentation

Dokumentasi interaktif tersedia di:

```
http://localhost:3000/api/docs
```

---

## 📤 Format Response

### Success Response

```json
{
  "success": true,
  "data": {}, // atau []
  "message": "Success message"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detail error 1", "Detail error 2"] // optional
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "message": "Data retrieved successfully"
}
```

---

## ❌ Error Handling

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (Validation error)
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Messages

```json
{
  "success": false,
  "message": "Waktu booking harus dalam slot 1 jam penuh (contoh: 13:00-14:00)"
}
```

```json
{
  "success": false,
  "message": "Waktu booking tidak boleh di masa lalu"
}
```

```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

## 📄 Pagination

### Query Parameters

- `page` (integer, optional): Nomor halaman (default: 1)
- `limit` (integer, optional): Jumlah item per halaman (default: 10, max: 100)
- `sortBy` (string, optional): Field untuk sorting
- `sortOrder` (string, optional): Urutan sorting ("asc" atau "desc", default: "asc")

### Contoh

```
GET /api/v1/users?page=2&limit=20&sortBy=namaLengkap&sortOrder=asc
```

---

## 🔗 Endpoints

### Health Check

#### Get API Health Status

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Get API Information

```http
GET /api/v1
```

**Response:**

```json
{
  "success": true,
  "message": "Kaizen API v1",
  "version": "1.0.0",
  "documentation": "/api/docs",
  "endpoints": {
    "users": "/api/v1/users",
    "communal": "/api/v1/communal",
    "serbaguna": "/api/v1/serbaguna",
    "mesinCuciCewe": "/api/v1/mesin-cuci-cewe",
    "mesinCuciCowo": "/api/v1/mesin-cuci-cowo",
    "dapur": "/api/v1/dapur"
  }
}
```

---

### Users Management

#### Get All Users

```http
GET /api/v1/users
```

**Query Parameters:**

- `page`, `limit`, `sortBy`, `sortOrder` (pagination parameters)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "idAngkatan": "1",
      "namaLengkap": "John Doe",
      "namaPanggilan": "John",
      "nomorWa": "+6281234567890",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "angkatan": {
        "id": "1",
        "namaAngkatan": "Angkatan 2024"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Get User by ID

```http
GET /api/v1/users/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "idAngkatan": "1",
    "namaLengkap": "John Doe",
    "namaPanggilan": "John",
    "nomorWa": "+6281234567890",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "angkatan": {
      "id": "1",
      "namaAngkatan": "Angkatan 2024"
    }
  }
}
```

#### Create New User

```http
POST /api/v1/users
```

**Request Body:**

```json
{
  "idAngkatan": "1",
  "namaLengkap": "Jane Doe",
  "namaPanggilan": "Jane",
  "nomorWa": "+6281234567891"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "2",
    "idAngkatan": "1",
    "namaLengkap": "Jane Doe",
    "namaPanggilan": "Jane",
    "nomorWa": "+6281234567891",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Resource created successfully"
}
```

#### Update User

```http
PUT /api/v1/users/{id}
```

**Request Body:**

```json
{
  "namaLengkap": "Jane Smith",
  "nomorWa": "+6281234567892"
}
```

#### Delete User

```http
DELETE /api/v1/users/{id}
```

#### Get Users by Angkatan

```http
GET /api/v1/users/angkatan/{angkatanId}
```

#### Get User by WhatsApp Number

```http
GET /api/v1/users/wa/{nomorWa}
```

---

### Communal Room Booking

#### Get All Communal Bookings

```http
GET /api/v1/communal
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "idPenanggungJawab": "1",
      "waktuMulai": "2024-01-15T13:00:00.000Z",
      "waktuBerakhir": "2024-01-15T14:00:00.000Z",
      "jumlahPengguna": "5",
      "lantai": "2",
      "keterangan": "Meeting rutin mingguan",
      "isDone": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "penanggungJawab": {
        "id": "1",
        "namaLengkap": "John Doe",
        "namaPanggilan": "John",
        "nomorWa": "+6281234567890"
      }
    }
  ]
}
```

#### Create Communal Booking

```http
POST /api/v1/communal
```

**Request Body:**

```json
{
  "idPenanggungJawab": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z",
  "jumlahPengguna": "5",
  "lantai": "2",
  "keterangan": "Meeting rutin mingguan",
  "isDone": false
}
```

**Validasi:**

- ✅ Waktu harus dalam slot 1 jam penuh (contoh: 13:00-14:00)
- ✅ Waktu tidak boleh di masa lalu
- ✅ Penanggung jawab harus exist di database
- ✅ Ruang tidak boleh double booking

#### Update Communal Booking

```http
PUT /api/v1/communal/{id}
```

#### Delete Communal Booking

```http
DELETE /api/v1/communal/{id}
```

#### Get Communal by Responsible Person

```http
GET /api/v1/communal/penanggung-jawab/{penanggungJawabId}
```

#### Get Communal by Floor

```http
GET /api/v1/communal/lantai/{lantai}
```

#### Get Available Time Slots

```http
GET /api/v1/communal/available-slots/{date}/{lantai}
```

**Example:**

```http
GET /api/v1/communal/available-slots/2024-01-15/2
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "waktuMulai": "2024-01-15T06:00:00.000Z",
      "waktuBerakhir": "2024-01-15T07:00:00.000Z",
      "available": true
    },
    {
      "waktuMulai": "2024-01-15T13:00:00.000Z",
      "waktuBerakhir": "2024-01-15T14:00:00.000Z",
      "available": false
    }
  ]
}
```

#### Get Time Slot Suggestions

```http
GET /api/v1/communal/time-slots?date=2024-01-15
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "waktuMulai": "2024-01-15T06:00:00.000Z",
      "waktuBerakhir": "2024-01-15T07:00:00.000Z",
      "display": "06:00 - 07:00"
    },
    {
      "waktuMulai": "2024-01-15T07:00:00.000Z",
      "waktuBerakhir": "2024-01-15T08:00:00.000Z",
      "display": "07:00 - 08:00"
    }
  ]
}
```

---

### Serbaguna Area Booking

#### Get All Serbaguna Bookings

```http
GET /api/v1/serbaguna
```

#### Create Serbaguna Booking

```http
POST /api/v1/serbaguna
```

**Request Body:**

```json
{
  "idPenanggungJawab": "1",
  "idArea": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z",
  "jumlahPengguna": "8",
  "keterangan": "Diskusi kelompok proyek",
  "isDone": false
}
```

#### Get Available Areas

```http
GET /api/v1/serbaguna/areas
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "namaArea": "Area Meeting A"
    },
    {
      "id": "2",
      "namaArea": "Area Meeting B"
    }
  ]
}
```

#### Get Serbaguna by Area

```http
GET /api/v1/serbaguna/area/{areaId}
```

#### Get Available Time Slots for Area

```http
GET /api/v1/serbaguna/available-slots/{date}/{areaId}
```

#### Other Endpoints

- `PUT /api/v1/serbaguna/{id}` - Update booking
- `DELETE /api/v1/serbaguna/{id}` - Delete booking
- `GET /api/v1/serbaguna/{id}` - Get by ID
- `GET /api/v1/serbaguna/penanggung-jawab/{penanggungJawabId}` - Get by responsible person
- `GET /api/v1/serbaguna/time-slots?date=2024-01-15` - Get time slot suggestions

---

### Kitchen Booking

#### Get All Kitchen Bookings

```http
GET /api/v1/dapur
```

#### Create Kitchen Booking

```http
POST /api/v1/dapur
```

**Request Body:**

```json
{
  "idFasilitas": "1",
  "idPeminjam": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z",
  "pinjamPeralatan": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "idFasilitas": "1",
    "idPeminjam": "1",
    "waktuMulai": "2024-01-15T13:00:00.000Z",
    "waktuBerakhir": "2024-01-15T14:00:00.000Z",
    "pinjamPeralatan": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "peminjam": {
      "id": "1",
      "namaLengkap": "John Doe",
      "namaPanggilan": "John",
      "nomorWa": "+6281234567890"
    },
    "fasilitas": {
      "id": "1",
      "fasilitas": "Kompor Gas"
    }
  },
  "message": "Booking dapur berhasil dibuat"
}
```

#### Get Available Kitchen Facilities

```http
GET /api/v1/dapur/facilities
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "fasilitas": "Kompor Gas"
    },
    {
      "id": "2",
      "fasilitas": "Microwave"
    }
  ]
}
```

#### Get Kitchen Bookings by Time Range

```http
GET /api/v1/dapur/time-range?startTime=2024-01-15T00:00:00.000Z&endTime=2024-01-15T23:59:59.999Z
```

#### Get Available Time Slots for Kitchen

```http
GET /api/v1/dapur/time-slots?date=2024-01-15&facilityId=1
```

#### Other Endpoints

- `PUT /api/v1/dapur/{id}` - Update booking
- `DELETE /api/v1/dapur/{id}` - Delete booking
- `GET /api/v1/dapur/{id}` - Get by ID
- `GET /api/v1/dapur/peminjam/{peminjamId}` - Get by borrower
- `GET /api/v1/dapur/fasilitas/{fasilitasId}` - Get by facility

---

### Women's Washing Machine Booking

#### Get All Women's Washing Machine Bookings

```http
GET /api/v1/mesin-cuci-cewe
```

#### Create Women's Washing Machine Booking

```http
POST /api/v1/mesin-cuci-cewe
```

**Request Body:**

```json
{
  "idFasilitas": "1",
  "idPeminjam": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z"
}
```

#### Get Available Women's Washing Machine Facilities

```http
GET /api/v1/mesin-cuci-cewe/facilities
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nama": "Mesin Cuci A - Cewe"
    },
    {
      "id": "2",
      "nama": "Mesin Cuci B - Cewe"
    }
  ]
}
```

#### Other Endpoints

- `PUT /api/v1/mesin-cuci-cewe/{id}` - Update booking
- `DELETE /api/v1/mesin-cuci-cewe/{id}` - Delete booking
- `GET /api/v1/mesin-cuci-cewe/{id}` - Get by ID
- `GET /api/v1/mesin-cuci-cewe/peminjam/{peminjamId}` - Get by borrower
- `GET /api/v1/mesin-cuci-cewe/fasilitas/{fasilitasId}` - Get by facility
- `GET /api/v1/mesin-cuci-cewe/time-range` - Get by time range
- `GET /api/v1/mesin-cuci-cewe/time-slots?date=2024-01-15&facilityId=1` - Get time slots

---

### Men's Washing Machine Booking

#### Get All Men's Washing Machine Bookings

```http
GET /api/v1/mesin-cuci-cowo
```

#### Create Men's Washing Machine Booking

```http
POST /api/v1/mesin-cuci-cowo
```

**Request Body:**

```json
{
  "idFasilitas": "1",
  "idPeminjam": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z"
}
```

#### Get Available Men's Washing Machine Facilities

```http
GET /api/v1/mesin-cuci-cowo/facilities
```

#### Other Endpoints

- `PUT /api/v1/mesin-cuci-cowo/{id}` - Update booking
- `DELETE /api/v1/mesin-cuci-cowo/{id}` - Delete booking
- `GET /api/v1/mesin-cuci-cowo/{id}` - Get by ID
- `GET /api/v1/mesin-cuci-cowo/peminjam/{peminjamId}` - Get by borrower
- `GET /api/v1/mesin-cuci-cowo/fasilitas/{fasilitasId}` - Get by facility
- `GET /api/v1/mesin-cuci-cowo/time-range` - Get by time range
- `GET /api/v1/mesin-cuci-cowo/time-slots?date=2024-01-15&facilityId=1` - Get time slots

---

## ⏰ Validasi Waktu

### Aturan Umum

1. **Slot Waktu 1 Jam**: Semua booking menggunakan slot 1 jam penuh

   - ✅ Valid: 13:00:00 - 14:00:00
   - ❌ Invalid: 13:30:00 - 14:30:00

2. **Waktu Harus Tepat Jam**: Menit, detik, dan milidetik harus 0

   - ✅ Valid: 2024-01-15T13:00:00.000Z
   - ❌ Invalid: 2024-01-15T13:15:00.000Z

3. **Tidak Boleh Masa Lalu**: Waktu booking tidak boleh sebelum waktu saat ini

4. **Jam Operasional**: 06:00 - 22:00 (16 slot per hari)

### Format Waktu

Gunakan format ISO 8601:

```
2024-01-15T13:00:00.000Z
```

### Slot Waktu Tersedia

```
06:00-07:00, 07:00-08:00, 08:00-09:00, 09:00-10:00,
10:00-11:00, 11:00-12:00, 12:00-13:00, 13:00-14:00,
14:00-15:00, 15:00-16:00, 16:00-17:00, 17:00-18:00,
18:00-19:00, 19:00-20:00, 20:00-21:00, 21:00-22:00
```

---

## 💡 Contoh Penggunaan

### 1. Membuat User Baru

```javascript
// POST /api/v1/users
const response = await fetch("http://localhost:3000/api/v1/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    idAngkatan: "1",
    namaLengkap: "Alice Johnson",
    namaPanggilan: "Alice",
    nomorWa: "+6281234567893",
  }),
});

const result = await response.json();
console.log(result);
```

### 2. Cek Slot Waktu Tersedia untuk Communal

```javascript
// GET /api/v1/communal/available-slots/2024-01-15/2
const response = await fetch(
  "http://localhost:3000/api/v1/communal/available-slots/2024-01-15/2"
);
const result = await response.json();

// Filter hanya slot yang tersedia
const availableSlots = result.data.filter((slot) => slot.available);
console.log("Available slots:", availableSlots);
```

### 3. Booking Ruang Communal

```javascript
// POST /api/v1/communal
const bookingData = {
  idPenanggungJawab: "1",
  waktuMulai: "2024-01-15T15:00:00.000Z",
  waktuBerakhir: "2024-01-15T16:00:00.000Z",
  jumlahPengguna: "8",
  lantai: "2",
  keterangan: "Workshop programming",
  isDone: false,
};

const response = await fetch("http://localhost:3000/api/v1/communal", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(bookingData),
});

const result = await response.json();
if (result.success) {
  console.log("Booking berhasil:", result.data);
} else {
  console.error("Booking gagal:", result.message);
}
```

### 4. Get Booking History untuk User

```javascript
// GET /api/v1/communal/penanggung-jawab/1
const userId = "1";
const response = await fetch(
  `http://localhost:3000/api/v1/communal/penanggung-jawab/${userId}`
);
const result = await response.json();

console.log("Booking history:", result.data);
```

### 5. Update Booking Status

```javascript
// PUT /api/v1/communal/1
const bookingId = "1";
const updateData = {
  isDone: true,
  keterangan: "Meeting selesai dengan baik",
};

const response = await fetch(
  `http://localhost:3000/api/v1/communal/${bookingId}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  }
);

const result = await response.json();
console.log("Update result:", result);
```

### 6. Get Data dengan Pagination

```javascript
// GET /api/v1/users?page=2&limit=20&sortBy=namaLengkap&sortOrder=asc
const params = new URLSearchParams({
  page: "2",
  limit: "20",
  sortBy: "namaLengkap",
  sortOrder: "asc",
});

const response = await fetch(`http://localhost:3000/api/v1/users?${params}`);
const result = await response.json();

console.log("Users:", result.data);
console.log("Pagination info:", result.pagination);
```

---

## 🔧 Tips untuk Frontend Developer

### 1. Handling BigInt Fields

Semua ID dalam response menggunakan string format karena JavaScript tidak mendukung BigInt secara native dalam JSON.

```javascript
// ✅ Correct
const userId = "1";

// ❌ Wrong
const userId = 1;
```

### 2. Date Handling

Selalu gunakan format ISO 8601 untuk tanggal:

```javascript
// ✅ Correct
const waktuMulai = new Date("2024-01-15T13:00:00.000Z").toISOString();

// ❌ Wrong
const waktuMulai = "2024-01-15 13:00:00";
```

### 3. Error Handling

Selalu cek field `success` dalam response:

```javascript
const response = await fetch("/api/v1/users");
const result = await response.json();

if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.message);
  if (result.errors) {
    console.error("Details:", result.errors);
  }
}
```

### 4. Pagination Implementation

Contoh implementasi pagination di frontend:

```javascript
function buildPaginationUrl(baseUrl, page, limit, sortBy, sortOrder) {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);

  return `${baseUrl}?${params.toString()}`;
}

// Usage
const url = buildPaginationUrl("/api/v1/users", 2, 20, "namaLengkap", "asc");
```

### 5. Time Slot Selection Helper

```javascript
function generateTimeSlots() {
  const slots = [];
  for (let hour = 6; hour < 22; hour++) {
    const start = `${hour.toString().padStart(2, "0")}:00`;
    const end = `${(hour + 1).toString().padStart(2, "0")}:00`;
    slots.push({
      value: hour,
      label: `${start} - ${end}`,
      startTime: start,
      endTime: end,
    });
  }
  return slots;
}

// Convert to ISO format for API
function createBookingTime(date, hour) {
  const bookingDate = new Date(date);
  bookingDate.setHours(hour, 0, 0, 0);
  return bookingDate.toISOString();
}
```

---

## 📞 Support

Jika ada pertanyaan atau masalah dengan API, silakan hubungi tim development atau buat issue di repository project.

**Happy Coding! 🚀**
