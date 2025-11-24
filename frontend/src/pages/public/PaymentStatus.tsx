import { Box, Container, Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText, Stack, Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningIcon from "@mui/icons-material/Warning";
import { BRAND } from "../../theme";

interface PaymentData {
  order_id: string;
  id: string;
  udf3: string;
  customer_email: string;
  customer_phone: string;
  amount: string;
  udf1: string;
  udf2: string;
  udf4: string;
  date_created: string;
}

type PaymentStatus = "CHARGED" | "FAILED" | "PENDING" | "TIMEOUT" | "ERROR";

export default function PaymentStatus() {
  const navigate = useNavigate();
  const [status] = useState<PaymentStatus>("CHARGED");
  
  const paymentData: PaymentData = {
    order_id: "ORD-2025-001234",
    id: "TXN-HDFC-5678901",
    udf3: "John Doe",
    customer_email: "john.doe@example.com",
    customer_phone: "+91 98765 43210",
    amount: "5,000",
    udf1: "Delhi Academic Center",
    udf2: "DAC-001",
    udf4: "Delhi",
    date_created: "13 Nov 2025, 10:30 AM",
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: { xs: 3, md: 5 } }}>
        <Card
          sx={{
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
          }}
        >
          <CardHeader
            title={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Transaction Details
                </Typography>
              </Box>
            }
            sx={{
              backgroundColor: BRAND.lightBgHighlight,
              borderBottom: `1px solid ${BRAND.borderColor}`,
              "& .MuiCardHeader-title": {
                display: "flex",
                alignItems: "center",
                gap: 1,
              },
            }}
          />

          <CardContent>
            {/* Status Message */}
            <Box sx={{ mb: 3 }}>
              {status === "CHARGED" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "12px 16px",
                    backgroundColor: "#E8F5E9",
                    borderRadius: 1,
                    color: BRAND.success,
                    fontWeight: 600,
                  }}
                >
                  <CheckCircleIcon />
                  <Typography sx={{ fontWeight: 600 }}>
                    The payment was successful!
                  </Typography>
                </Box>
              )}

              {status === "FAILED" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "12px 16px",
                    backgroundColor: "#FFEBEE",
                    borderRadius: 1,
                    color: BRAND.error,
                    fontWeight: 600,
                  }}
                >
                  <CancelIcon />
                  <Typography sx={{ fontWeight: 600 }}>
                    Payment failed. Please contact Training Manager.
                  </Typography>
                </Box>
              )}

              {status === "PENDING" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "12px 16px",
                    backgroundColor: "#FFF3E0",
                    borderRadius: 1,
                    color: BRAND.warning,
                    fontWeight: 600,
                  }}
                >
                  <AccessTimeIcon />
                  <Typography sx={{ fontWeight: 600 }}>
                    Your transaction is being processed. Please do not close this window while we retrieve the latest details.
                  </Typography>
                </Box>
              )}

              {status === "TIMEOUT" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "12px 16px",
                    backgroundColor: "#FFF3E0",
                    borderRadius: 1,
                    color: BRAND.warning,
                    fontWeight: 600,
                  }}
                >
                  <AccessTimeIcon />
                  <Typography sx={{ fontWeight: 600 }}>
                    We are still processing your payment. Don't worry! You will receive an email confirmation once the transaction is complete.
                  </Typography>
                </Box>
              )}

              {status === "ERROR" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "12px 16px",
                    backgroundColor: "#FFEBEE",
                    borderRadius: 1,
                    color: BRAND.error,
                    fontWeight: 600,
                  }}
                >
                  <WarningIcon />
                  <Typography sx={{ fontWeight: 600 }}>
                    Error checking payment status. Please contact Training Manager.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Payment Details */}
            <List
              sx={{
                "& .MuiListItem-root": {
                  borderBottom: `1px solid ${BRAND.borderColor}`,
                  px: 0,
                  py: 1.5,
                },
                "& .MuiListItem-root:last-child": {
                  borderBottom: "none",
                },
              }}
            >
                <ListItem disablePadding>
                  <ListItemText
                    primary="Order Id"
                    secondary={paymentData.order_id}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Transaction ID"
                    secondary={paymentData.id}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Payee"
                    secondary={paymentData.udf3}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Email"
                    secondary={paymentData.customer_email}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Contact"
                    secondary={paymentData.customer_phone}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Amount"
                    secondary={`₹${paymentData.amount}`}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Academic Center"
                    secondary={`${paymentData.udf1}...`}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Center Code"
                    secondary={paymentData.udf2}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="State"
                    secondary={paymentData.udf4}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Payment Date"
                    secondary={paymentData.date_created}
                    primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                  />
                </ListItem>
              </List>

            {/* Action Buttons */}
            <Stack sx={{ mt: 3, gap: 1 }}>
              {status === "FAILED" && (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate("/")}
                >
                  Back to Home
                </Button>
              )}
              {status === "CHARGED" && (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate("/")}
                >
                  Back to Home
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
