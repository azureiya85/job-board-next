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

interface VerificationEmailProps {
  firstName: string;
  verificationUrl: string;
}

export const VerificationEmail = ({
  firstName,
  verificationUrl,
}: VerificationEmailProps) => {
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
              Welcome to our platform! Please click the button below to verify your email address and complete your registration.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>
            
            <Text style={text}>
              If the button does not work, you can also click this link:
            </Text>
            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              This verification link will expire in 24 hours. If you did not create an account with us, you can safely ignore this email.
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
  backgroundColor: '#007ee6',
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
  color: '#007ee6',
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
  margin: '0',
};