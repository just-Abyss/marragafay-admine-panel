import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface BookingEmailProps {
    name: string;
    phone_number: string;
    package_title: string;
    date: string;
    guests: number;
    adults?: number;
    children?: number;
    total_price: number;
    status: string;
    notes?: string;
}

export const BookingNotificationEmail = ({
    name = "Valued Guest",
    phone_number = "",
    package_title = "Unknown Package",
    date = new Date().toISOString(),
    guests = 1,
    adults = 1,
    children = 0,
    total_price = 0,
    status = "Pending",
    notes,
}: BookingEmailProps) => {
    // Safe Date Formatting
    let formattedDate = date;
    try {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    } catch (e) {
        console.error("Date format error:", e);
    }

    // Safe Price Formatting
    let formattedPrice = `${total_price} MAD`;
    try {
        formattedPrice = new Intl.NumberFormat("en-MA", {
            style: "currency",
            currency: "MAD",
        }).format(total_price);
    } catch (e) {
        console.error("Price format error:", e);
    }

    // Format phone for WhatsApp (remove spaces, +, etc)
    const waPhone = phone_number ? phone_number.replace(/[^0-9]/g, "") : "";

    // App URL (fallback to localhost if env not set)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return (
        <Html>
            <Head />
            <Preview>New Booking: {name} - {package_title}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={brandTitle}>MARRAGAFAY</Heading>
                        <Text style={subTitle}>New Booking Request</Text>
                    </Section>

                    {/* Main Booking Details */}
                    <Section style={contentSection}>
                        <Row>
                            <Column style={columnStyle}>
                                <Text style={label}>CUSTOMER</Text>
                                <Heading as="h4" style={value}>{name}</Heading>
                                <Text style={infoText}>{phone_number || "No phone provided"}</Text>
                            </Column>
                            <Column style={columnStyle}>
                                <Text style={label}>BOOKING</Text>
                                <Heading as="h4" style={value}>{package_title}</Heading>
                                <Text style={infoText}>
                                    {formattedDate} • {guests} Guests
                                    {/* Optional chaining for adults/children just in case */}
                                    <br />
                                    <span style={subInfo}>({adults ?? 1} Adults, {children ?? 0} Kids)</span>
                                </Text>
                            </Column>
                        </Row>

                        <Hr style={divider} />

                        <Row style={{ marginTop: "20px" }}>
                            <Column>
                                <Text style={label}>TOTAL PRICE</Text>
                                <Heading as="h3" style={priceValue}>{formattedPrice}</Heading>
                            </Column>
                            <Column>
                                <Text style={label}>STATUS</Text>
                                <Text style={statusBadge}>{status?.toUpperCase() || "PENDING"}</Text>
                            </Column>
                        </Row>

                        {notes && (
                            <Section style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fdf8f4", borderRadius: "8px" }}>
                                <Text style={{ ...label, marginBottom: "5px" }}>SPECIAL NOTES</Text>
                                <Text style={noteText}>{notes}</Text>
                            </Section>
                        )}
                    </Section>

                    {/* Action Buttons */}
                    <Section style={actionSection}>
                        <Row>
                            <Column align="center" style={{ paddingRight: "10px" }}>
                                <Button
                                    style={primaryButton}
                                    href={`tel:${phone_number}`}
                                >
                                    📞 Call Customer
                                </Button>
                            </Column>
                            <Column align="center" style={{ paddingLeft: "10px" }}>
                                <Button
                                    style={secondaryButton}
                                    href={`https://wa.me/${waPhone}`}
                                >
                                    💬 WhatsApp
                                </Button>
                            </Column>
                        </Row>
                        <Row style={{ marginTop: "15px" }}>
                            <Column align="center">
                                <Link href={`${baseUrl}/dashboard/bookings`} style={dashboardLink}>
                                    View in Dashboard →
                                </Link>
                            </Column>
                        </Row>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Marragafay Travels<br />
                            Marrakech, Morocco<br />
                            <Link href="https://marragafay.com" style={footerLink}>www.marragafay.com</Link>
                        </Text>
                        <Text style={footerSubText}>
                            © {new Date().getFullYear()} Marragafay. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default BookingNotificationEmail;

// --- Styles ---

const main = {
    backgroundColor: "#f5f5f5",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 20px",
    marginBottom: "64px",
    maxWidth: "600px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
};

const header = {
    textAlign: "center" as const,
    marginBottom: "30px",
};

const brandTitle = {
    fontSize: "28px",
    letterSpacing: "2px",
    fontWeight: "bold",
    color: "#C19B76",
    margin: "0",
};

const subTitle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#888888",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: "5px 0 0",
};

const contentSection = {
    padding: "0 10px",
};

const columnStyle = {
    verticalAlign: "top",
    width: "50%",
};

const label = {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#b0b0b0",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: "8px",
};

const value = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333333",
    margin: "0 0 5px",
};

const infoText = {
    fontSize: "14px",
    color: "#555555",
    margin: "0",
    lineHeight: "1.5",
};

const subInfo = {
    fontSize: "12px",
    color: "#888888",
};

const divider = {
    borderColor: "#f0f0f0",
    margin: "25px 0",
};

const priceValue = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#C19B76",
    margin: "0",
};

const statusBadge = {
    backgroundColor: "#f0fdf4",
    color: "#166534",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
};

const noteText = {
    fontSize: "14px",
    color: "#666666",
    fontStyle: "italic",
    margin: "0",
};

const actionSection = {
    marginTop: "40px",
    textAlign: "center" as const,
};

const primaryButton = {
    backgroundColor: "#C19B76",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 20px",
    width: "100%",
};

const secondaryButton = {
    backgroundColor: "#25D366", // WhatsApp Green
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 20px",
    width: "100%",
};

const dashboardLink = {
    fontSize: "14px",
    color: "#C19B76",
    textDecoration: "none",
    fontWeight: "500",
    display: "inline-block",
};

const footer = {
    marginTop: "40px",
    textAlign: "center" as const,
    borderTop: "1px solid #f0f0f0",
    paddingTop: "30px",
};

const footerText = {
    fontSize: "12px",
    color: "#999999",
    lineHeight: "1.6",
    margin: "0 0 10px",
};

const footerLink = {
    color: "#999999",
    textDecoration: "underline",
};

const footerSubText = {
    fontSize: "10px",
    color: "#cccccc",
    margin: "0",
};
