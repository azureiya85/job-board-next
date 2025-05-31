import { create } from 'zustand';
import { JobPostingInStore } from '@/stores/companyProfileStores';

interface CVModalState {
  isOpen: boolean;
  selectedJob: JobPostingInStore | null;
  isSubmitting: boolean;
  openModal: (job: JobPostingInStore) => void;
  closeModal: () => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useCVModalStore = create<CVModalState>((set) => ({
  isOpen: false,
  selectedJob: null,
  isSubmitting: false,
  openModal: (job: JobPostingInStore) => 
    set({ isOpen: true, selectedJob: job }),
  closeModal: () => 
    set({ isOpen: false, selectedJob: null, isSubmitting: false }),
  setSubmitting: (submitting: boolean) => 
    set({ isSubmitting: submitting }),
}));