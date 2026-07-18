import { supabase } from '../index';

export const createPendingPayment = async (data: {
  userId: string;
  agreementId: string;
  type: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
}) => {
  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      user_id: data.userId,
      agreement_id: data.agreementId,
      type: data.type,
      amount: data.amount,
      status: 'PENDING',
      paystack_reference: data.reference,
      metadata: data.metadata || {},
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create payment: ${error.message}`);
  return payment;
};

export const findPaymentByReference = async (reference: string) => {
  // paystack_reference is a legacy column name; it now stores the Flutterwave tx_ref
  const { data: payment, error } = await supabase
    .from('payments')
    .select('id, agreement_id, status')
    .eq('paystack_reference', reference)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No payment found
    }
    throw new Error(`Failed to find payment: ${error.message}`);
  }

  return payment;
};

export const markPaymentSuccessful = async (reference: string) => {
  const payment = await findPaymentByReference(reference);
  if (!payment) return null;

  const { error: paymentError } = await supabase
    .from('payments')
    .update({ status: 'SUCCESS' })
    .eq('id', payment.id);

  if (paymentError) {
    throw new Error(`Failed to update payment: ${paymentError.message}`);
  }

  if (payment.agreement_id) {
    const { error: agreementError } = await supabase
      .from('agreements')
      .update({ status: 'ACTIVE' })
      .eq('id', payment.agreement_id);

    if (agreementError) {
      throw new Error(`Failed to update agreement: ${agreementError.message}`);
    }
  }

  return payment;
};
