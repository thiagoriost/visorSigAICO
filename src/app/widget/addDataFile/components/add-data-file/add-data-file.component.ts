import { Component, ViewChild } from '@angular/core';
import { AddDataFileService } from '@app/widget/addDataFile/services/add-data-file.service';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { FileSelectEvent } from 'primeng/fileupload';

/**
 * Componente para la carga y procesamiento de archivos de datos.
 *
 * Este componente permite a los usuarios cargar archivos (como GPX, GeoJSON, KML, TopoJSON, Shapefile),
 * visualizar la información del archivo cargado, y simular un proceso de carga progresiva. Además, maneja
 * la selección de capas y validaciones relacionadas con la carga de archivos.
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @date 09-04-2025
 * @version 1.0.0
 *
 */

@Component({
  selector: 'app-add-data-file',
  standalone: true,
  imports: [CommonModule, FileUploadModule, ToastModule],
  templateUrl: './add-data-file.component.html',
  styleUrls: ['./add-data-file.component.scss'],
  providers: [MessageService],
})
export class AddDataFileComponent {
  @ViewChild('fileUploader') fileUploader!: FileUpload; // Referencia al componente p-fileUpload
  errorMessage: string | null = null; // Mensaje de error si ocurre algún problema
  uploadIcon = 'file_upload'; // Ícono que se muestra antes de cargar el archivo
  dragDropText = 'Arrastra y suelta archivos KML, SHP, GEOJSON, GPX, ZIP.'; // Texto informativo para la carga del archivo
  fileName = ''; // Nombre del archivo seleccionado
  fileSize = ''; // Tamaño del archivo seleccionado
  selectedFile: File | null = null; // Archivo seleccionado
  maxFileSize = 20 * 1024 * 1024; // Tamaño máximo permitido para el archivo (20MB)

  constructor(
    private addDataFile: AddDataFileService, // Servicio que maneja la carga y procesamiento del archivo
    private messageService: MessageService // Servicio que maneja los mensajes de error
  ) {}

  /**
   * onFileChange(event: FileSelectEvent)
   * Este método se ejecuta cuando el usuario selecciona un archivo.
   * Extrae el archivo y lo pasa al método loadFile para cargarlo.
   *
   * @param event - El evento de selección que contiene los archivos seleccionados.
   */
  onFileChange(event: FileSelectEvent): void {
    // Verifica si el evento contiene archivos y selecciona el primer archivo.
    if (event.files && event.files.length) {
      const file = event.files[0]; // Primer archivo seleccionado
      // Verifica si el archivo excede el tamaño máximo permitido
      if (file.size > this.maxFileSize) {
        this.errorMessage =
          'El archivo es demasiado grande. El tamaño máximo permitido es 20MB.';
        return;
      }
      // Asigna el archivo seleccionado y carga el archivo
      this.selectedFile = file;
      this.loadFile(file);
    }
  }

  /**
   * loadFile(file: File)
   * Este método carga el archivo seleccionado utilizando un FileReader.
   * Si la carga es exitosa, pasa el contenido del archivo al servicio `addDataFile` para procesarlo.
   *
   * @param file - El archivo seleccionado por el usuario.
   */
  public loadFile(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = reader.result as string;

      try {
        // Llamamos a loadData, que ahora es sincrónico en su mayoría
        this.addDataFile.loadData(fileContent, file.name, file);

        // Si la carga es exitosa, restablecer los errores y continuar
        this.errorMessage = null;

        // Limpiar el componente de carga después del procesamiento exitoso
        this.fileUploader.clear();
      } catch (error) {
        // Si ocurre un error, mostramos el mensaje de error correspondiente
        if (error instanceof Error) {
          this.errorMessage = this.getErrorMessage(error);
        } else {
          this.errorMessage = 'Ocurrió un error desconocido.';
        }
      }
    };

    reader.readAsText(file);
  }

  /**
   * getErrorMessage(error: Error)
   * Este método genera un mensaje de error basado en el tipo de error.
   *
   * @param error - El objeto error que se genera al procesar el archivo.
   * @returns Un mensaje de error adecuado basado en el contenido del error.
   */
  public getErrorMessage(error: Error): string {
    // Si el error está relacionado con el formato del archivo
    if (error.message.includes('Formato de archivo no soportado')) {
      return 'El archivo seleccionado no es compatible. Por favor, elige un archivo con formato GPX, GeoJSON, KML, TopoJSON o Shapefile.';
    }
    // Si el error no es reconocido, se devuelve un mensaje genérico.
    return 'Error al procesar el archivo. Intenta nuevamente.';
  }
}
