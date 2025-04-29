// src/api/ApiService.ts
import { User } from "@/contexts/AuthContext";
import { AppSettings, ThemeConfig, defaultAppSettings } from "../slices/themeDefaults";

export interface Customer {
  id?: number;
  name: string;
  dnt: string;
  dni: string;
  status: 'Active' | 'Inactive';
}

export interface Office {
  id?: string;
  name: string;
  deviceCode?: string;
  data: {
    maxAppointments?: number;
    address?: string;
    holidays?: string[]; // ISO date strings for holidays and non-working days
    workingHours?: {
      start: string; // Format: "HH:MM"
      end: string;   // Format: "HH:MM"
    };
    devices?: string[]; // Array of device IDs associated with this office
  }
}

export interface Zone {
  id?: string;
  name: string;
}

export interface Priority {
  id?: string;
  name: string;
}

export interface ZoneOffice {
  zoneId: string;
  officeId: string;
}

export interface ZoneOfficeInfo {
  id: string;
  name: string;
  data: any; // Use a more specific type if you know the structure
  zones: Zone[];
}

export interface PriorityAdvisor {
  priorityId: string;
  advisorId: string;
}

export interface QueueItem {
  queueId: string; // Do not change this name, it's used in the backend
  code: string;
  type: string;
  status: string;
  customer: string;
  advisor: string;
  advisorId: string;
  createdDate: string;
  scheduled: string;
}

export interface Appointment {
  id: string;
  customer: string; // Assuming customer name or identifier
  date: string; // ISO date string?
  time: string; // "HH:MM" format?
  officeId: string;
  zoneId: string;
  // Add other relevant appointment details
}

export default class ApiService {

  static BASE_URL = "https://legger-workflows-app-develop.azurewebsites.net/webhook"; // Reemplaza con tu API Gateway

  private static LOCAL_STORAGE_KEY = "turnopolis-settings";
  private static SETTINGS_ENDPOINT = "/settings";
  private static REQUEST_TIMEOUT = 8000; // 8 segundos de timeout

  // Masters endpoints
  private static CUSTOMERS_ENDPOINT = "/customers";
  private static OFFICES_ENDPOINT = "/offices";

  private static OFFICES_ZONAS_ENDPOINT = "/offices-zonas";
  private static OFFICES_AVAILABILITY_ENDPOINT = "/offices-availability";
  private static ZONES_ENDPOINT = "/zones";
  private static PRIORITIES_ENDPOINT = "/priorities";
  private static ZONE_OFFICES_ENDPOINT = "/zone-offices";
  private static PRIORITY_ADVISORS_ENDPOINT = "/priority-advisors";

   //Appointment Endpoints
   private static APPOINTMENT_ENDPOINT = "/appointments"; // Corrected typo
   private static APPOINTMENT_CONFIRM_ENDPOINT = "/appointments/confirm"; // Added endpoint for confirmation by document


   //Security
   private static SECURITY_LOGIN_ENDPOINT = "/login";
   private static SECURITY_ME_ENDPOINT = "/me";

  //Advisor Endpoints
  private static ADVISOR_QUEUE_ENDPOINT = "/advisor/queue";
  private static ADVISOR_TOGGLE_STATUS_ENDPOINT = "/advisor/toggle_status";
  private static ADVISOR_CLAIM_NEXT_ENDPOINT = "/advisor/claim-next";
  private static ADVISOR_CLAIM_QUEUE_ENDPOINT = "/advisor/claim-queue";

  //Queue Endpoints
  private static QUEUE_CANCEL_ENDPOINT = "/queue/cancel";
  private static QUEUE_COMPLETE_ENDPOINT = "/queue/complete";
  private static QUEUE_CREATE_ENDPOINT = "/queue/create";

  // Método genérico para hacer peticiones con timeout
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const token = localStorage.getItem("auth_token") ;

      // Crear la promesa para el fetch
      const fetchPromise = fetch(`${this.BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          'X-Token': token || "",
        },
        ...options,
      });

      // Competir entre el fetch y el timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), this.REQUEST_TIMEOUT)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
         const errorData = await response.json();
         console.error(`Error en la solicitud: ${response.statusText}`, errorData);
         throw new Error(errorData.message || `Error en la solicitud: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data);
      return data as T;
    } catch (error) {
      console.error("Error en la API:", error);
      throw error;
    }
  }

  // ========== MÉTODOS PARA TODAS LAS CONFIGURACIONES ==========

  // Obtener todas las configuraciones
  static async fetchSettings(): Promise<AppSettings> {
    try {
      console.log("Fetching settings from server...");
      const settings = await this.request<AppSettings>(this.SETTINGS_ENDPOINT);
      this.saveSettingsLocally(settings);
      console.log("Settings fetched successfully:", settings);
      return settings;
    } catch (error) {
      console.warn("Error al obtener configuraciones del servidor, usando almacenamiento local", error);
      return this.getSettingsFromLocalStorage();
    }
  }

  // ========== MÉTODOS PARA LAS COLAS ==========

  static async queueCancel(data: any): Promise<any> {
    try {
      await this.request<any>(this.QUEUE_CANCEL_ENDPOINT, { method: "PUT", body: JSON.stringify(data), });
    } catch (error) {
      console.warn("Error al obtener configuraciones del servidor, usando almacenamiento local", error);
    }
  }

  static async queueComplete(data: any): Promise<any> {
    try {
      await this.request<any>(this.QUEUE_COMPLETE_ENDPOINT, { method: "PUT", body: JSON.stringify(data), });
    } catch (error) {
      console.warn("Error al obtener configuraciones del servidor, usando almacenamiento local", error);
    }
  }


  static async queueCreate(appointmentId: string): Promise<QueueItem> {
     return await this.request<QueueItem>(this.QUEUE_CREATE_ENDPOINT, {
       method: "POST",
       body: JSON.stringify({ appointmentId }), // Corrected typo
     });
   }

  // ========== MÉTODOS PARA LOS ASESORES ==========

  // Obtener cola del asesor
  static async fetchAdvisorQueue(): Promise<QueueItem[]> {
      return await this.request<QueueItem[]>(this.ADVISOR_QUEUE_ENDPOINT);
  }

  static async toggleStatusAdvisor(): Promise<QueueItem[]> {
    return await this.request<QueueItem[]>(this.ADVISOR_TOGGLE_STATUS_ENDPOINT,{
        method: "PUT",
        body: JSON.stringify({}),
      });
  }

  // Obtener siguiente en la cola
  static async fetchAdvisorNextQueue(): Promise<QueueItem> {
      return await this.request<QueueItem>(this.ADVISOR_CLAIM_NEXT_ENDPOINT);
  }

  // Obtener un turno específico de la cola del asesor (para llamarlo manualmente)
  static async fetchAdvisorQueueTurn(queueId: string): Promise<QueueItem> {
      return await this.request<QueueItem>(`${this.ADVISOR_CLAIM_QUEUE_ENDPOINT}?queueId=${queueId}`);
  }

  // Actualizar todas las configuraciones
  static async updateSettings(settings: AppSettings): Promise<AppSettings> {
    try {
      console.log("Updating settings on server:", settings);
      const updatedSettings = await this.request<AppSettings>(this.SETTINGS_ENDPOINT, {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      this.saveSettingsLocally(settings);
      console.log("Settings updated successfully:", updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.warn("No se pudo guardar en el servidor, guardando localmente.", error);
      this.saveSettingsLocally(settings);
      return settings;
    }
  }

  // ========== MÉTODOS PARA TEMAS ==========

  // Legacy: Obtener sólo el tema
  static async fetchTheme(): Promise<ThemeConfig> {
    try {
      console.log('Fetching theme settings');

      const settings = await this.fetchSettings();
      return settings.theme;
    } catch {
      const settings = this.getSettingsFromLocalStorage();
      return settings.theme;
    }
  }

  // Legacy: Actualizar sólo el tema
  static async updateTheme(themeData: ThemeConfig): Promise<ThemeConfig> {
    try {
      console.log('Updating theme settings', themeData);
      const currentSettings = await this.fetchSettings();
      const updatedSettings = {
        ...currentSettings,
        theme: themeData
      };

      await this.updateSettings(updatedSettings);
      return themeData;
    } catch {
      const currentSettings = this.getSettingsFromLocalStorage();
      const updatedSettings = {
        ...currentSettings,
        theme: themeData
      };

      this.saveSettingsLocally(updatedSettings);
      return themeData;
    }
  }

  // ========== MÉTODOS DE ALMACENAMIENTO LOCAL ==========

  // Guardar todas las configuraciones en localStorage
  static saveSettingsLocally(settings: AppSettings) {
    console.log("Saving settings to localStorage:", settings);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }

  // Recuperar todas las configuraciones desde localStorage
  static getSettingsFromLocalStorage(): AppSettings {
    const savedSettings = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    const settings = savedSettings ? (JSON.parse(savedSettings) as AppSettings) : defaultAppSettings;
    console.log("Retrieved settings from localStorage:", settings);
    return settings;
  }

  // Legacy: Guardar sólo el tema en localStorage
  static saveThemeLocally(theme: ThemeConfig) {
    const currentSettings = this.getSettingsFromLocalStorage();
    this.saveSettingsLocally({
      ...currentSettings,
      theme
    });
  }

  // Legacy: Recuperar sólo el tema desde localStorage
  static getThemeFromLocalStorage(): ThemeConfig {
    const settings = this.getSettingsFromLocalStorage();
    return settings.theme;
  }

  // ========== MÉTODOS PARA CLIENTES ==========

  // Obtener todos los clientes
  static async fetchCustomers(): Promise<Customer[]> {
    try {
      return await this.request<Customer[]>(this.CUSTOMERS_ENDPOINT);
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  }

  // Obtener un cliente específico
  static async fetchCustomer(id: number): Promise<Customer | null> {
    try {
      return await this.request<Customer>(`${this.CUSTOMERS_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      return null;
    }
  }

  // Crear un nuevo cliente
  static async createCustomer(customer: Customer): Promise<Customer> {
    return await this.request<Customer>(this.CUSTOMERS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(customer),
    });
  }

  // Actualizar un cliente existente
  static async updateCustomer(id: number, customer: Customer): Promise<Customer> {
    return await this.request<Customer>(`${this.CUSTOMERS_ENDPOINT}/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    });
  }

  // Eliminar un cliente
  static async deleteCustomer(id: number): Promise<void> {
    await this.request<void>(`${this.CUSTOMERS_ENDPOINT}/${id}`, {
      method: "DELETE",
    });
  }

  // ========== MÉTODOS PARA OFICINAS ==========

  // Obtener todas las oficinas
  static async fetchOffices(): Promise<Office[]> {
    try {
      return await this.request<Office[]>(this.OFFICES_ENDPOINT);
    } catch (error) {
      console.error("Error fetching offices:", error);
      return [];
    }
  }

  // Obtener todas las zonas de una oficina
  static async fetchOfficesZones(id: string): Promise<ZoneOfficeInfo> {
      return await this.request<ZoneOfficeInfo>(`${this.OFFICES_ZONAS_ENDPOINT}?id=${id}`);
  }

  // Obtener una oficina específica
  static async fetchOffice(id: number): Promise<Office | null> {
    try {
      return await this.request<Office>(`${this.OFFICES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error fetching office ${id}:`, error);
      return null;
    }
  }

  // Crear una nueva oficina
  static async createOffice(office: Office): Promise<Office> {
    return await this.request<Office>(this.OFFICES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(office),
    });
  }

  // Actualizar una oficina existente
  static async updateOffice(id: string, office: Office): Promise<Office> {
    return await this.request<Office>(`${this.OFFICES_ENDPOINT}`, {
      method: "PUT",
      body: JSON.stringify(office),
    });
  }

  // Actualizar la disponibilidad de una oficina
  static async updateOfficeAvailability(id: string,
    office: Office): Promise<Office> {
    office.id = id;
    return await this.request<Office>(`${this.OFFICES_AVAILABILITY_ENDPOINT}`, {
      method: "PUT",
      body: JSON.stringify(office),
    });
  }

  // Actualizar oficinas devices
  static async updateOfficeDevices(id: string, devices: string[]): Promise<Office> {
    const office = await this.fetchOffice(parseInt(id));
    if (!office) {
      throw new Error(`Office with ID ${id} not found`);
    }

    if (!office.data) {
      office.data = {};
    }

    office.data.devices = devices;

    return await this.request<Office>(`${this.OFFICES_ENDPOINT}/${id}`, {
      method: "PUT",
      body: JSON.stringify(office),
    });
  }

  // Eliminar una oficina
  static async deleteOffice(id: string): Promise<void> {
    await this.request<void>(`${this.OFFICES_ENDPOINT}/${id}`, {
      method: "DELETE",
    });
  }

  // ========== MÉTODOS PARA ZONAS ==========

  // Obtener todas las zonas
  static async fetchZones(): Promise<Zone[]> {
    try {
      return await this.request<Zone[]>(this.ZONES_ENDPOINT);
    } catch (error) {
      console.error("Error fetching zones:", error);
      return [];
    }
  }

  // Obtener una zona específica
  static async fetchZone(id: number): Promise<Zone | null> {
    try {
      return await this.request<Zone>(`${this.ZONES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error fetching zone ${id}:`, error);
      return null;
    }
  }

  // Crear una nueva zona
  static async createZone(zone: Zone): Promise<Zone> {
    return await this.request<Zone>(this.ZONES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(zone),
    });
  }

  // Actualizar una zona existente
  static async updateZone(id: string, zone: Zone): Promise<Zone> {
    return await this.request<Zone>(`${this.ZONES_ENDPOINT}/${id}`, {
      method: "PUT",
      body: JSON.stringify(zone),
    });
  }

  // Eliminar una zona
  static async deleteZone(id: string): Promise<void> {
    await this.request<void>(`${this.ZONES_ENDPOINT}/${id}`, {
      method: "DELETE",
    });
  }

  // ========== MÉTODOS PARA PRIORIDADES ==========

  // Obtener todas las prioridades
  static async fetchPriorities(): Promise<Priority[]> {
    try {
      return await this.request<Priority[]>(this.PRIORITIES_ENDPOINT);
    } catch (error) {
      console.error("Error fetching priorities:", error);
      return [];
    }
  }

  // Obtener una prioridad específica
  static async fetchPriority(id: number): Promise<Priority | null> {
    try {
      return await this.request<Priority>(`${this.PRIORITIES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error fetching priority ${id}:`, error);
      return null;
    }
  }

  // Crear una nueva prioridad
  static async createPriority(priority: Priority): Promise<Priority> {
    return await this.request<Priority>(this.PRIORITIES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(priority),
    });
  }

  // Actualizar una prioridad existente
  static async updatePriority(id: number, priority: Priority): Promise<Priority> {
    return await this.request<Priority>(`${this.PRIORITIES_ENDPOINT}/${id}`, {
      method: "PUT",
      body: JSON.stringify(priority),
    });
  }

  // Eliminar una prioridad
  static async deletePriority(id: number): Promise<void> {
    await this.request<void>(`${this.PRIORITIES_ENDPOINT}/${id}`, {
      method: "DELETE",
    });
  }

  // ========== MÉTODOS PARA RELACIONES ZONA-OFICINA ==========

  // Obtener oficinas por zona
  static async fetchOfficesByZone(zoneId: string): Promise<Office[]> {
    try {
      return await this.request<Office[]>(`${this.ZONES_ENDPOINT}/${zoneId}/offices`);
    } catch (error) {
      console.error(`Error fetching offices for zone ${zoneId}:`, error);
      return [];
    }
  }

  // Obtener zonas por oficina
  static async fetchZonesByOffice(officeId: string): Promise<Zone[]> {
    try {
      return await this.request<Zone[]>(`${this.OFFICES_ENDPOINT}/${officeId}/zones`);
    } catch (error) {
      console.error(`Error fetching zones for office ${officeId}:`, error);
      return [];
    }
  }

  // Asociar zona y oficina
  static async associateZoneOffice(zoneId: string, officeId: string): Promise<void> {
    await this.request<void>(this.ZONE_OFFICES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ zoneId, officeId }),
    });
  }

  // Desasociar zona y oficina
  static async dissociateZoneOffice(zoneId: string, officeId: string): Promise<void> {
    await this.request<void>(`${this.ZONE_OFFICES_ENDPOINT}/${zoneId}/${officeId}`, {
      method: "DELETE",
    });
  }

  // ========== MÉTODOS PARA RELACIONES PRIORIDAD-ASESOR ==========

  // Obtener asesores por prioridad
  static async fetchAdvisorsByPriority(priorityId: number): Promise<any[]> {
    try {
      return await this.request<any[]>(`${this.PRIORITIES_ENDPOINT}/${priorityId}/advisors`);
    } catch (error) {
      console.error(`Error fetching advisors for priority ${priorityId}:`, error);
      return [];
    }
  }

  // Obtener prioridades por asesor
  static async fetchPrioritiesByAdvisor(advisorId: number): Promise<Priority[]> {
    try {
      return await this.request<Priority[]>(`/advisors/${advisorId}/priorities`);
    } catch (error) {
      console.error(`Error fetching priorities for advisor ${advisorId}:`, error);
      return [];
    }
  }

  // Asociar prioridad y asesor
  static async associatePriorityAdvisor(priorityId: number, advisorId: number): Promise<void> {
    await this.request<void>(this.PRIORITY_ADVISORS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ priorityId, advisorId }),
    });
  }

  // Desasociar prioridad y asesor
  static async dissociatePriorityAdvisor(priorityId: number, advisorId: number): Promise<void> {
    await this.request<void>(`${this.PRIORITY_ADVISORS_ENDPOINT}/${priorityId}/${advisorId}`, {
      method: "DELETE",
    });
  }

  // ========== MÉTODOS CITAS ==========

  static async createAppointment(appointment:any): Promise<Appointment> {
    return await this.request<Appointment>(this.APPOINTMENT_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(appointment),
    });
  }

  // Fetch appointment by document type and number
  static async fetchAppointmentByDocument(documentType: string, documentNumber: string): Promise<Appointment | null> {
     try {
       return await this.request<Appointment>(
         `${this.APPOINTMENT_CONFIRM_ENDPOINT}?documentType=${encodeURIComponent(documentType)}&documentNumber=${encodeURIComponent(documentNumber)}`
       );
     } catch (error) {
       if (error instanceof Error && error.message.includes("404")) {
         // Handle not found specifically
         console.log("Appointment not found for this document.");
         return null;
       }
       console.error(`Error fetching appointment for document ${documentNumber}:`, error);
       return null;
     }
   }

  // ========== MÉTODOS PARA REPORTES ==========

  // Obtener todos los reportes
  static async fetchReports(): Promise<any[]> {
    try {
      // Cuando el endpoint esté listo, descomentar esta línea:
      // return await this.request<any[]>('/reports');

      // Por ahora, devolvemos datos de ejemplo
      return [
        { id: 1, title: "Monthly Sales Report", date: "April 2025" },
        { id: 2, title: "Customer Feedback Analysis", date: "March 2025" },
        { id: 3, title: "Appointment Trends", date: "February 2025" },
        { id: 4, title: "Revenue Breakdown", date: "January 2025" },
        { id: 5, title: "Yearly Performance", date: "December 2024" },
        { id: 6, title: "Employee Productivity", date: "November 2024" },
        { id: 7, title: "Marketing Campaign Results", date: "October 2024" },
      ];
    } catch (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
  }

  // Obtener un reporte específico por ID
  static async fetchReport(id: number): Promise<any | null> {
    try {
      // Cuando el endpoint esté listo, descomentar esta línea:
      // return await this.request<any>(`/reports/${id}`);

      // Por ahora, simulamos la búsqueda en los datos de ejemplo
      const reports = await this.fetchReports();
      return reports.find(report => report.id === id) || null;
    } catch (error) {
      console.error(`Error fetching report ${id}:`, error);
      return null;
    }
  }


// ========== MÉTODOS SEGURIDAD ==========

static async login(email:string, password:string): Promise<{ access_token: string }> {
  return await this.request<{ access_token: string }>(this.SECURITY_LOGIN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({email, password}),
  });
}

static async me(): Promise<{ data: User }> {
  return await this.request<{ data: User }>(this.SECURITY_ME_ENDPOINT);
}



}
