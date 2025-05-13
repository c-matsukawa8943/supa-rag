declare module 'react-dropzone' {
  import { ComponentType } from 'react';

  export interface FileRejection {
    file: File;
    errors: {
      code: string;
      message: string;
    }[];
  }

  export interface DropzoneOptions {
    accept?: Record<string, string[]>;
    disabled?: boolean;
    maxFiles?: number;
    maxSize?: number;
    minSize?: number;
    multiple?: boolean;
    onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => void;
    onDropAccepted?: (files: File[], event: DropEvent) => void;
    onDropRejected?: (fileRejections: FileRejection[], event: DropEvent) => void;
    onFileDialogCancel?: () => void;
    preventDropOnDocument?: boolean;
  }

  export interface DropzoneState {
    getRootProps: (props?: any) => any;
    getInputProps: (props?: any) => any;
    open: () => void;
    isDragActive: boolean;
    isDragAccept: boolean;
    isDragReject: boolean;
    isFileDialogActive: boolean;
  }

  type DropEvent = React.DragEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>;

  export function useDropzone(options?: DropzoneOptions): DropzoneState;
} 