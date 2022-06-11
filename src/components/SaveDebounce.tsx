import { Dispatch, SetStateAction, useState, useEffect } from "react";

type returnvalue = [string, Dispatch<SetStateAction<string>>];

function useSaveDebounce(delay = 350): returnvalue {
    const [search, setSearch] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const delayFn = setTimeout(() => {
            setSearch(searchQuery);
        }, delay);
        return () => clearTimeout(delayFn);
    }, [searchQuery, delay]);

    return [search, setSearchQuery];
}
export default useSaveDebounce;
