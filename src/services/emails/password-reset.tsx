import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
} from '@react-email/components';

interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({
  firstName,
  resetUrl,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={title}>Your App</Text>
          </Section>
          
          <Section style={section}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              We received a request to reset the password for your account. Click the button below to set a new password.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>
            
            <Text style={text}>
              If the button does not work, you can also click this link:
            </Text>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              This password reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email - your password will remain unchanged.
            </Text>
            
            <Text style={footer}>
              For security reasons, this link can only be used once.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
};

const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '8px',
  textAlign: 'center' as const,
};

const text = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  fontWeight: 'bold',
};

const link = {
  fontSize: '14px',
  color: '#dc2626',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#dedede',
  margin: '20px 0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  margin: '0 0 8px',
};