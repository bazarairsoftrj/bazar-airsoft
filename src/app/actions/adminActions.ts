'use server';

import { supabase } from '@/lib/supabase';
import { decryptPhone, hashSha256 } from '@/lib/crypto';
import crypto from 'crypto';

export async function createReportAction(formData: FormData) {
  try {
    const listingId = formData.get('listingId') as string;
    const reason = formData.get('reason') as any;
    const details = (formData.get('details') as string) || null;

    if (!listingId || !reason) return { error: 'Dados incompletos.' };

    const { error } = await supabase.from('reports').insert({
      listing_id: listingId,
      reason,
      details,
      status: 'PENDENTE',
    });

    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getAdminDashboardData() {
  try {
    // 1. Anúncios
    const { data: allListings } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        price,
        status,
        city,
        created_at,
        categories ( name ),
        seller_contacts ( display_name, phone_encrypted )
      `)
      .order('created_at', { ascending: false });

    // 2. Denúncias pendentes
    const { data: reports } = await supabase
      .from('reports')
      .select(`
        id,
        reason,
        details,
        status,
        created_at,
        listings (
          id,
          title,
          status,
          price,
          seller_contacts ( display_name, phone_encrypted )
        )
      `)
      .eq('status', 'PENDENTE')
      .order('created_at', { ascending: false });

    // 3. Solicitações de recuperação pendentes
    const { data: recoveries } = await supabase
      .from('recovery_requests')
      .select(`
        id,
        phone,
        status,
        created_at,
        listings (
          id,
          title,
          price,
          seller_contacts ( display_name )
        )
      `)
      .eq('status', 'PENDENTE')
      .order('created_at', { ascending: false });

    const listingsProcessed = allListings?.map((item: any) => {
      let rawPhone = '';
      if (item.seller_contacts?.phone_encrypted) {
        rawPhone = decryptPhone(item.seller_contacts.phone_encrypted);
      }
      return {
        ...item,
        seller_phone: rawPhone,
      };
    }) || [];

    const reportsProcessed = reports?.map((rep: any) => {
      let rawPhone = '';
      if (rep.listings?.seller_contacts?.phone_encrypted) {
        rawPhone = decryptPhone(rep.listings.seller_contacts.phone_encrypted);
      }
      return {
        ...rep,
        seller_phone: rawPhone,
      };
    }) || [];

    return {
      metrics: {
        totalListings: listingsProcessed.length,
        activeListings: listingsProcessed.filter((l: any) => l.status === 'PUBLICADO').length,
        soldListings: listingsProcessed.filter((l: any) => l.status === 'VENDIDO').length,
        pendingReports: reportsProcessed.length,
        pendingRecoveries: recoveries?.length || 0,
      },
      listings: listingsProcessed,
      reports: reportsProcessed,
      recoveries: recoveries || [],
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function adminUpdateListingStatus(listingId: string, status: string) {
  try {
    const { error } = await supabase
      .from('listings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', listingId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function adminDeleteListing(listingId: string) {
  try {
    const { error } = await supabase.from('listings').delete().eq('id', listingId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function adminUpdateReportStatus(reportId: string, status: string) {
  try {
    const { error } = await supabase
      .from('reports')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function adminGenerateSellerManageLink(listingId: string) {
  try {
    const newToken = crypto.randomBytes(16).toString('hex');
    const newTokenHash = hashSha256(newToken);

    const { error } = await supabase
      .from('listings')
      .update({ manage_token_hash: newTokenHash })
      .eq('id', listingId);

    if (error) return { error: error.message };
    return { success: true, manageToken: newToken };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Conclui uma solicitação de recuperação de anúncio
 */
export async function adminResolveRecoveryRequest(recoveryId: string) {
  try {
    const { error } = await supabase
      .from('recovery_requests')
      .update({ status: 'RESOLVIDO' })
      .eq('id', recoveryId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}