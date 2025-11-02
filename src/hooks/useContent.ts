import { useState } from "react";


export const useContent = () => {
const [output, setOutput] = useState<string>("");
return { output, setOutput };
};