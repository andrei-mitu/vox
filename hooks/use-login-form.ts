'use client';

import {useRouter} from 'next/navigation';
import React, {useCallback, useState} from 'react';
import {requestLogin} from '@/lib/client/login-client';
import {type LoginFieldErrors, parseLoginCredentials,} from '@/lib/dto/auth.dto';

export function useLoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
    const [serverError, setServerError] = useState('');

    const submit = useCallback(async () => {
        setServerError('');
        const parsed = parseLoginCredentials({email, password});
        if (!parsed.ok) {
            setFieldErrors(parsed.error);
            return;
        }
        setFieldErrors({});
        setEmail(parsed.data.email);
        setPassword(parsed.data.password);

        const result = await requestLogin(parsed.data);
        if (!result.ok) {
            setServerError(result.error);
            return;
        }

        router.push('/');
    }, [email, password, router]);

    const handleSubmit = useCallback(
        async (e: React.SubmitEvent) => {
            e.preventDefault();
            await submit();
        },
        [submit]
    );

    return {
        email,
        password,
        fieldErrors,
        serverError,
        setEmail,
        setPassword,
        handleSubmit,
    };
}
