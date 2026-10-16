'use server';

import { supabase } from '@/lib/supabase';
import { encryptPhone, hashSha256 } from '@/lib/crypto';
import crypto from 'crypto';

function isValidBrazilianMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  const ddd = parseInt(digits.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  if (digits.charAt(2) !== '9') return false;
  return true;
}

export async function createListingAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const categoryId = Number(formData.get('categoryId'));
    const price = Number(formData.get('price'));
    const condition = formData.get('condition') as string;
    const city = formData.get('city') as string;
    const region = (formData.get('region') as string) || null;
    const description = formData.get('description') as string;
    const sellerName = formData.get('sellerName') as string;
    const rawPhone = formData.get('phone') as string;
    const imageUrlsJson = formData.get('imageUrls') as string;
    const imageUrls: string[] = imageUrlsJson ? JSON.parse(imageUrlsJson) : [];

    if (!title || title.trim().length < 5) return { error: 'O título deve ter pelo menos 5 caracteres.' };
    if (!categoryId) return { error: 'Selecione uma categoria.' };
    if (isNaN(price) || price < 0) return { error: 'Indique um preço válido.' };
    if (!city || city.trim().length < 2) return { error: 'Indique a sua cidade.' };
    if (!description || description.trim().length < 15) return { error: 'A descrição deve ter pelo menos 15 caracteres.' };
    if (!sellerName || sellerName.trim().length < 2) return { error: 'Indique o seu nome.' };
    if (!isValidBrazilianMobile(rawPhone)) {
      return { error: 'Número de WhatsApp inválido. Utilize o formato: (XX) 9XXXX-XXXX.' };
    }
    if (imageUrls.length === 0) return { error: 'Adicione pelo menos 1 fotografia do equipamento.' };

    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneHash = hashSha256(cleanPhone);
    const phoneEncrypted = encryptPhone(cleanPhone);

    const { data: seller, error: sellerError } = await supabase
      .from('seller_contacts')
      .insert({
        display_name: sellerName.trim(),
        phone_encrypted: phoneEncrypted,
        phone_hash: phoneHash,
      })
      .select('id')
      .single();

    if (sellerError || !seller) {
      return { error: 'Erro ao registar contacto: ' + (sellerError?.message || '') };
    }

    const listingId = 'air-' + crypto.randomBytes(4).toString('hex');
    const manageToken = crypto.randomBytes(16).toString('hex');
    const manageTokenHash = hashSha256(manageToken);

    const { error: listingError } = await supabase
      .from('listings')
      .insert({
        id: listingId,
        seller_contact_id: seller.id,
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        price,
        condition,
        city: city.trim(),
        region: region ? region.trim() : null,
        status: 'PUBLICADO',
        manage_token_hash: manageTokenHash,
      });

    if (listingError) return { error: 'Erro ao registar anúncio: ' + listingError.message };

    const imagesToInsert = imageUrls.slice(0, 4).map((url, index) => ({
      listing_id: listingId,
      storage_key: `listing_${listingId}_${index}`,
      public_url: url,
      sort_order: index,
    }));

    await supabase.from('listing_images').insert(imagesToInsert);

    return {
      success: true,
      listingId,
      manageToken,
    };
  } catch (err: any) {
    return { error: err.message || 'Erro inesperado.' };
  }
}

export async function getListingByManageToken(token: string) {
  try {
    const tokenHash = hashSha256(token);

    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        description,
        price,
        condition,
        city,
        region,
        category_id,
        status,
        expires_at,
        created_at,
        categories ( id, name ),
        listing_images ( public_url )
      `)
      .eq('manage_token_hash', tokenHash)
      .single();

    if (error || !listing) {
      return { error: 'Anúncio não encontrado ou link de gestão inválido.' };
    }

    return { listing };
  } catch (err: any) {
    return { error: err.message || 'Erro ao carregar dados.' };
  }
}

export async function updateListingStatusAction(token: string, newStatus: string) {
  try {
    const tokenHash = hashSha256(token);

    const updatePayload: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'VENDIDO') {
      updatePayload.sold_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('listings')
      .update(updatePayload)
      .eq('manage_token_hash', tokenHash);

    if (error) return { error: 'Falha ao atualizar estado: ' + error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateListingFullAction(token: string, formData: FormData) {
  try {
    const tokenHash = hashSha256(token);

    const title = formData.get('title') as string;
    const categoryId = Number(formData.get('categoryId'));
    const price = Number(formData.get('price'));
    const condition = formData.get('condition') as string;
    const city = formData.get('city') as string;
    const region = (formData.get('region') as string) || null;
    const description = formData.get('description') as string;

    if (!title || title.trim().length < 5) return { error: 'O título deve ter pelo menos 5 caracteres.' };
    if (!categoryId) return { error: 'Selecione uma categoria válida.' };
    if (isNaN(price) || price < 0) return { error: 'Indique um preço válido não negativo.' };
    if (!city || city.trim().length < 2) return { error: 'Indique a sua cidade.' };
    if (!description || description.trim().length < 15) return { error: 'A descrição deve ter pelo menos 15 caracteres.' };

    const { error } = await supabase
      .from('listings')
      .update({
        title: title.trim(),
        category_id: categoryId,
        price,
        condition,
        city: city.trim(),
        region: region ? region.trim() : null,
        description: description.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('manage_token_hash', tokenHash);

    if (error) return { error: 'Falha ao atualizar o anúncio: ' + error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Erro inesperado ao salvar alterações.' };
  }
}

export async function deleteListingAction(token: string) {
  try {
    const tokenHash = hashSha256(token);
    const { error } = await supabase.from('listings').delete().eq('manage_token_hash', tokenHash);
    if (error) return { error: 'Falha ao remover anúncio: ' + error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Consulta os anúncios de um telefone SEM expor o token diretamente
 */
export async function getListingsByPhoneAction(phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      return { error: 'Indique um número com DDD e 9 dígitos.' };
    }

    const phoneHash = hashSha256(cleanPhone);

    const { data: contacts } = await supabase
      .from('seller_contacts')
      .select('id, display_name')
      .eq('phone_hash', phoneHash);

    if (!contacts || contacts.length === 0) {
      return { error: 'Nenhum anúncio encontrado associado a este número.' };
    }

    const contactIds = contacts.map((c) => c.id);

    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, status, price')
      .in('seller_contact_id', contactIds);

    if (!listings || listings.length === 0) {
      return { error: 'Nenhum anúncio ativo associado a este número.' };
    }

    return {
      success: true,
      items: listings,
      sellerName: contacts[0].display_name,
      phone: cleanPhone,
    };
  } catch (err: any) {
    return { error: err.message || 'Erro ao consultar anúncios.' };
  }
}

/**
 * Registra a notificação de solicitação de recuperação para o admin
 */
export async function recordRecoveryRequestAction(listingId: string, phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    await supabase.from('recovery_requests').insert({
      listing_id: listingId,
      phone: cleanPhone,
      status: 'PENDENTE',
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}