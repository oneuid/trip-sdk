import { TicketCredential } from './types';

/**
 * Saves a cryptographically signed ticket credential from Trip.Express 
 * into the user's sovereign UID.one Vault.
 *
 * @param uidClient An initialized instance of the OneUID client from @oneuid-auth-js/core.
 * @param ticket The ticket credential object containing payload, issuer, and signature.
 */
export async function saveTicketToUIDVault(
  uidClient: any,
  ticket: TicketCredential
): Promise<any> {
  const title = `Trip.Express Booking: ${ticket.payload.booking_ref}`;
  const payloadStr = JSON.stringify(ticket.payload);
  
  if (typeof uidClient.addVaultRecord !== 'function') {
    throw new Error('Provided uidClient is invalid or does not support addVaultRecord.');
  }

  return uidClient.addVaultRecord(
    title,
    payloadStr,
    'ticket', // Vault record type
    null, // sessionKey (defaults to null for unencrypted metadata index or auto-handled by client)
    'COMPLETED', // syncStatus
    ticket.issuer,
    ticket.signature
  );
}
