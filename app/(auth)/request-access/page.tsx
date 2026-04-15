"use client";

import {
    Callout,
    Text,
    TextArea
}                               from "@radix-ui/themes";
import Link                     from "next/link";
import { Button }               from "@/components/ui/Button";
import { Card }                 from "@/components/ui/Card";
import { Heading }              from "@/components/ui/Heading";
import { Input }                from "@/components/ui/Input";
import { VoxLogo }              from "@/components/ui/vox-logo";
import { useRequestAccessForm } from "@/hooks/use-request-access-form";

export default function RequestAccessPage() {
    const {
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
    } = useRequestAccessForm();

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <VoxLogo width={ 180 } height={ 90 }/>
            <Card size="4" className="w-full shadow-(--shadow-card)">
                { submitted ? (
                    <div className="flex flex-col gap-4">
                        <Heading align="center" size="6" className="text-text-primary">
                            Request received
                        </Heading>
                        <Callout.Root color="green" role="status">
                            <Callout.Text>
                                Your request has been submitted. An admin will review it and
                                reach out with your login credentials if approved.
                            </Callout.Text>
                        </Callout.Root>
                        <Text size="2" align="center" color="gray">
                            Already have access?{ " " }
                            <Link href="/login" className="underline underline-offset-2">
                                Sign in
                            </Link>
                        </Text>
                    </div>
                ) : (
                    <form
                        onSubmit={ handleSubmit }
                        className="flex flex-col gap-5"
                        noValidate
                    >
                        <Heading align="center" size="6" className="text-text-primary">
                            Request access
                        </Heading>

                        <Text size="2" align="center" color="gray">
                            Vox is currently invite-only. Fill in the form below and an admin
                            will review your request.
                        </Text>

                        { serverError && (
                            <Text color="red" size="2" align="center" role="alert">
                                { serverError }
                            </Text>
                        ) }

                        <Input
                            label="Full name"
                            error={ fieldErrors.fullName }
                            id="fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            size="3"
                            value={ fullName }
                            onChange={ (e) => setFullName(e.target.value) }
                        />

                        <Input
                            label="Email"
                            error={ fieldErrors.email }
                            id="email"
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={ false }
                            size="3"
                            value={ email }
                            onChange={ (e) => setEmail(e.target.value) }
                        />

                        <Input
                            label="Company"
                            error={ fieldErrors.companyName }
                            id="companyName"
                            name="companyName"
                            type="text"
                            autoComplete="organization"
                            size="3"
                            value={ companyName }
                            onChange={ (e) => setCompanyName(e.target.value) }
                        />

                        <div className="flex flex-col gap-1">
                            <div
                                className="flex flex-row flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 min-w-0">
                                <Text
                                    as="label"
                                    htmlFor="message"
                                    size="2"
                                    weight="medium"
                                    className="text-(--text-secondary) shrink-0"
                                >
                                    Why do you want access?{ " " }
                                    <Text size="2" color="gray">
                                        (optional)
                                    </Text>
                                </Text>
                                { fieldErrors.message && (
                                    <Text color="red" size="1" role="alert">
                                        { fieldErrors.message }
                                    </Text>
                                ) }
                            </div>
                            <TextArea
                                id="message"
                                name="message"
                                size="3"
                                rows={ 3 }
                                value={ message }
                                onChange={ (e) => setMessage(e.target.value) }
                            />
                        </div>

                        <Button type="submit" size="3" className="mt-2 text-white">
                            Request access
                        </Button>

                        <Text size="2" align="center" color="gray">
                            Already have access?{ " " }
                            <Link href="/login" className="underline underline-offset-2">
                                Sign in
                            </Link>
                        </Text>
                    </form>
                ) }
            </Card>
        </div>
    );
}
