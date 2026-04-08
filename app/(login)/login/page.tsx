'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { VoxLogo } from '@/components/ui/vox-logo';
import { useLoginForm } from '@/hooks/use-login-form';
import { Text } from '@radix-ui/themes';

export default function LoginPage() {
  const {
    email,
    password,
    fieldErrors,
    serverError,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      <VoxLogo width={180} height={90} />
      <Card size="4" className="w-full shadow-[var(--shadow-card)]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          autoComplete="on"
          noValidate
        >
          <Heading align="center" size="6" className="text-[var(--text-primary)]">
            Sign in to Vox
          </Heading>

          {serverError && (
            <Text color="red" size="2" align="center" role="alert">
              {serverError}
            </Text>
          )}

          <Input
            label="Email"
            error={fieldErrors.email}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            size="3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            error={fieldErrors.password}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            size="3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" size="3" className="mt-2 text-white">
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
}
