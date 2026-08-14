import { create } from 'zustand';

export const useMarketStore = create((set) => ({
  searchTerm: "",
  selectedCommodity: "all",
  useLivePrices: true,
  alertModalOpen: false,
  alertCommodity: "Rice",
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCommodity: (commodity) => set({ selectedCommodity: commodity }),
  toggleLivePrices: () => set((state) => ({ useLivePrices: !state.useLivePrices })),
  
  setAlertModalOpen: (isOpen) => set({ alertModalOpen: isOpen }),
  setAlertCommodity: (commodity) => set({ alertCommodity: commodity }),
  openAlertModal: (commodity) => set({ alertModalOpen: true, alertCommodity: commodity }),
  
  resetFilters: () => set({ searchTerm: "", selectedCommodity: "all" })
}));
