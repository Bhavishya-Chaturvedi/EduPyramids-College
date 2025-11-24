import { Box, Container, Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText, Stack, Button, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningIcon from "@mui/icons-material/Warning";
import { BRAND } from "../../theme";

interface PaymentData {
  transaction_id: string;
  order_id: string;
  udf3: string;
  customer_email: string;
  customer_phone: string;
  amount: string;
  udf1: string;
  udf2: string;
  udf4: string;
  date_created: string;
  order_status: string;
}

type PaymentStatus = "CHARGED" | "FAILED" | "PENDING" | "TIMEOUT" | "ERROR";

export default function PaymentStatus() {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const [status, setStatus] = useState<PaymentStatus>("PENDING");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setError("No transaction ID provided");
      setLoading(false);
      return;
    }

    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/payments/transaction/${transactionId}/`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transaction details");
        }

        const data = await response.json();
        setPaymentData(data);
        setError(null); // Clear error when data loads successfully

        // Determine status based on order_status
        if (data.order_status === "CHARGED") {
          setStatus("CHARGED");
        } else if (data.order_status === "FAILED" || data.order_status === "NO_TRANSACTION") {
          setStatus("FAILED");
        } else if (data.order_status === "PENDING" || data.order_status === "PENDING_VBV" || data.order_status === "AUTHORIZING") {
          setStatus("PENDING");
        } else if (!data.order_status || data.order_status === "" || data.order_status === null) {
          // If no status yet, assume CHARGED (transaction was created successfully)
          setStatus("CHARGED");
        } else {
          setStatus("PENDING"); // Default to pending for unknown statuses
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setStatus("ERROR");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: { xs: 3, md: 5 } }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Box
            sx={{
              padding: "12px 16px",
              backgroundColor: "#FFEBEE",
              borderRadius: 1,
              color: BRAND.error,
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>{error}</Typography>
          </Box>
        )}

        {!loading && paymentData && (
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
                      secondary={paymentData.transaction_id}
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
                  {paymentData.udf1 && (
                    <ListItem disablePadding>
                      <ListItemText
                        primary="Academic Center"
                        secondary={`${paymentData.udf1}...`}
                        primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                      />
                    </ListItem>
                  )}
                  {paymentData.udf2 && (
                    <ListItem disablePadding>
                      <ListItemText
                        primary="Center Code"
                        secondary={paymentData.udf2}
                        primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                      />
                    </ListItem>
                  )}
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
                      secondary={new Date(paymentData.date_created).toLocaleString()}
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
        )}
      </Box>
    </Container>
  );
}
