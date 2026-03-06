import { useEffect, useState } from "react";
import ConsultationService from "@/services/ConsultationService";

export function useGetActiveConsultations(){
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const load = async() => {
            try{
                const consultations = await ConsultationService.getConsultations();
                if(!mounted) return;
                const active = (consultations || []).filter((c) => c.status !== "closed");
                setData(active);
            } catch (error){
                if (mounted){
                    setData([]);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    return { data, isLoading };
}