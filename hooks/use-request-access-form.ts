"use client";

import type React              from "react";
import {
    useCallback,
    useState
}                              from "react";
import { submitAccessRequest } from "@/lib/client/request-access-client";
import {
    parseRequestAccessForm,
    type RequestAccessFieldErrors,
}                              from "@/lib/dto/auth.dto";

export function useRequestAccessForm() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<RequestAccessFieldErrors>({});
    const [serverError, setServerError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setServerError("");

            const parsed = parseRequestAccessForm({
                fullName,
                email,
                companyName,
                message: message || undefined,
            });

            if ( !parsed.ok ) {
                setFieldErrors(parsed.error);
                return;
            }

            setFieldErrors({});

            const result = await submitAccessRequest(parsed.data);
            if ( !result.ok ) {
                setServerError(result.error);
                return;
            }

            setSubmitted(true);
        },
        [fullName, email, companyName, message],
    );

    return {
        fullName,
        email,
        companyName,
        message,
        fieldErrors,
        serverError,
        submitted,
        setFullName,
        setEmail,
        setCompanyName,
        setMessage,
        handleSubmit,
    };
}
