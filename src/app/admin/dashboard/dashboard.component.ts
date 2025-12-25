import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/shared/service.service';
import { AuthService } from 'src/app/shared/service/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  ffplImg: string[] = [];
  custImg: string[] = [];
  convertImagesForm!: FormGroup;
  fleetguardFile: File | null | undefined;
  customerFile: File | null | undefined;
  fleetguardImages: string[] = [];
  customerImages: string[] = [];
  selectedImages: { path: string, type: string }[] = [];
  labeledImagePathsFFPL: string[] = [];
  labeledImagePathsCUST: string[] = [];
  labeledTextPathsFFPL: string[] = [];
  labeledTextPathsCUST: string[] = [];
  excelSheetName: string | null = null;
  excelSheetUrl: string | null = null;
  baseUrl: string = 'http://148.66.159.168:8000';  // Replace with your backend URL
  excelGenerated: boolean | undefined;

  constructor(
    private service: ServiceService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.convertImagesForm = this.fb.group({});
    this.authService.startTokenRefreshTimer(); // Start token refresh on component load
  }

  rotationDegree1: number = 0;
  rotationDegree2: number = 0;

  rotateImage1() {
    this.rotationDegree1 = (this.rotationDegree1 + 90) % 360;
  }

  rotateImage2() {
    this.rotationDegree2 = (this.rotationDegree2 + 90) % 360;
  }

  onFileSelected(event: any, type: string) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      if (type === 'fleetguard') {
        this.fleetguardFile = fileList[0];
      } else if (type === 'customer') {
        this.customerFile = fileList[0];
      }

      // **Reset data only if a new file is selected after Excel generation**
      if (this.excelGenerated) {
        this.resetData();
        this.toastr.info('Data reset for new file processing', 'New File Selected');
        this.excelGenerated = false; // Reset flag
      }

    } else {
      if (type === 'fleetguard') {
        this.fleetguardFile = null;
      } else if (type === 'customer') {
        this.customerFile = null;
      }
    }
  }

  resetData() {
    this.ffplImg = [];
    this.custImg = [];
    this.fleetguardImages = [];
    this.customerImages = [];
    this.selectedImages = [];
    this.labeledImagePathsFFPL = [];
    this.labeledImagePathsCUST = [];
    this.labeledTextPathsFFPL = [];
    this.labeledTextPathsCUST = [];
    this.excelSheetName = null;
    this.excelSheetUrl = null;
  }

  postFleetguardData() {
    if (!this.fleetguardFile) {
      this.toastr.error('Please select a Fleetguard file.', 'Error');
      return;
    }

    const formData: FormData = new FormData();
    formData.append('file', this.fleetguardFile);
    const token = this.authService.getAccessToken();

    if (token) {
      this.service.postPdfImagesData(formData, token).subscribe({
        next: (res) => {
          this.ffplImg = res.jpeg_images;
          this.fleetguardImages = res.jpeg_images.map((imagePath: string) => `${this.baseUrl}${imagePath}`);
          this.toastr.success('Fleetguard file successfully converted', 'Success');
        },
        error: () => {
          this.toastr.error('An error occurred with Fleetguard file conversion', 'Error');
        }
      });
    } else {
      this.authService.logout();
    }
  }

  postCustomerData() {
    if (!this.customerFile) {
      this.toastr.error('Please select a Customer file.', 'Error');
      return;
    }

    const formData: FormData = new FormData();
    formData.append('file', this.customerFile);
    const token = this.authService.getAccessToken();

    if (token) {
      this.service.postPdfImagesData(formData, token).subscribe({
        next: (res) => {
          this.custImg = res.jpeg_images;
          this.customerImages = res.jpeg_images.map((imagePath: string) => `${this.baseUrl}${imagePath}`);
          this.toastr.success('Customer file successfully converted', 'Success');
        },
        error: () => {
          this.toastr.error('An error occurred with Customer file conversion', 'Error');
        }
      });
    } else {
      this.authService.logout();
    }
  }

  selectImage(imagePath: string, imgType: string, event: any) {
    if (event.target.checked) {
      this.selectedImages.push({ path: imagePath, type: imgType });
    } else {
      this.selectedImages = this.selectedImages.filter(image => image.path !== imagePath);
    }
  }

  labelImage(type: string) {
    const selectedImages = this.selectedImages.filter(image => image.type === type);
    if (selectedImages.length === 0) {
      this.toastr.error('Please select images to label.', 'Error');
      return;
    }

    if (type === 'FFPL') {
      this.labeledImagePathsFFPL = [];  // Clear previous labeled images
      this.labeledTextPathsFFPL = [];   // Clear previous labeled text paths
    } else if (type === 'CUST') {
      this.labeledImagePathsCUST = [];  // Clear previous labeled images
      this.labeledTextPathsCUST = [];   // Clear previous labeled text paths
    }

    selectedImages.forEach(selectedImage => {
      const imagePath = selectedImage.path.replace(this.baseUrl, '');

      const payload = `image=${encodeURIComponent(imagePath)}&img_type=${encodeURIComponent(selectedImage.type)}`;
      this.service.postLabelledImageData(payload).subscribe(
        (res) => {
          const outputImagePath = res.output_image_url.replace(/\\/g, '/');
          const formattedImagePath = `${this.baseUrl}${outputImagePath}`;

          const outputTxtPath = res.output_txt_url.replace(/\\/g, '/');
          const formattedTxtPath = `${this.baseUrl}${outputTxtPath}`;

          if (type === 'FFPL') {
            this.labeledImagePathsFFPL.push(formattedImagePath);
            this.labeledTextPathsFFPL.push(formattedTxtPath);
          } else if (type === 'CUST') {
            this.labeledImagePathsCUST.push(formattedImagePath);
            this.labeledTextPathsCUST.push(formattedTxtPath);
          }

          this.toastr.success(`Image labeled successfully as ${type}`, 'Success');
        },
        (err) => {
          this.toastr.error('An error occurred while labeling the image', 'Error');
        }
      );
    });
  }

  generateExcelSheet() {
    // Ensure we have values to send
    const processPath = (path: string) => encodeURIComponent(path.replace(this.baseUrl, '').replace(/\\/g, '/'));

    // const ffplImage = this.labeledImagePathsFFPL.length > 0 ? processPath(this.labeledImagePathsFFPL[0]) : '';
    const ffplImage = this.ffplImg;
    const ffplYoloOutput = this.labeledTextPathsFFPL.length > 0 ? processPath(this.labeledTextPathsFFPL[0]) : '';
    const custImage = this.custImg;
    const custYoloOutput = this.labeledTextPathsCUST.length > 0 ? processPath(this.labeledTextPathsCUST[0]) : '';

    // Construct the payload string
    const payload = `ffpl_image=${ffplImage}&ffpl_yolo_output=${ffplYoloOutput}&cust_image=${custImage}&cust_yolo_output=${custYoloOutput}`;

    // Sending payload as a string
    this.service.generateExcelSheet(payload).subscribe(
      (res) => {
        this.excelSheetName = res.excel_file; // Assuming response contains the sheet name
        this.excelSheetUrl = `${this.baseUrl}/${this.excelSheetName}`; // Construct the URL to the Excel file
        this.toastr.success('Excel sheet generated successfully', 'Success');
        this.excelGenerated = true; // **Set flag after generation**
      },
      (err) => {
        console.error('Error:', err);
        this.toastr.error('An error occurred while generating the Excel sheet', 'Error');
      }
    );
  }
}
