/**
 * Descriptografa o telefone do vendedor e gera o link direto do WhatsApp
 */
export async function getSellerWhatsAppLinkAction(listingId: string) {
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        price,
        condition,
        city,
        region,
        seller_contacts ( phone_encrypted )
      `)
      .eq('id', listingId)
      .single();

    if (error || !listing) {
      return { error: 'Anúncio não encontrado.' };
    }

    const encryptedPhone = (listing.seller_contacts as any)?.phone_encrypted;
    if (!encryptedPhone) {
      return { error: 'Contato do vendedor não disponível.' };
    }

    const rawPhone = decryptPhone(encryptedPhone);
    const cleanPhone = rawPhone.replace(/\D/g, '');

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(listing.price));

    const conditionMap: Record<string, string> = {
      NOVO: 'Novo',
      SEMI_NOVO: 'Semi-novo',
      USADO: 'Usado',
      DEFEITO_PECAS: 'Peças / Com defeito',
    };
    const conditionLabel = conditionMap[listing.condition] || listing.condition;

    // Mensagem estruturada e detalhada
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bazar-airsoft-rj.vercel.app';
    const listingUrl = `${siteUrl}/anuncios/${listing.id}`;

    const messageText = 
      `Olá! Vi o seu anúncio no *Bazar Airsoft* e tenho interesse:\n\n` +
      `🎯 *Item:* ${listing.title}\n` +
      `💰 *Valor:* ${formattedPrice}\n` +
      `🏷️ *Condição:* ${conditionLabel}\n` +
      `📍 *Local:* ${listing.city}${listing.region ? ` (${listing.region})` : ''}\n` +
      `🔗 *Link:* ${listingUrl}\n\n` +
      `O produto ainda está disponível para negociação?`;

    const encodedMessage = encodeURIComponent(messageText);

    return {
      success: true,
      url: `https://wa.me/55${cleanPhone}?text=${encodedMessage}`,
    };
  } catch (err: any) {
    return { error: err.message || 'Erro ao gerar link de contato.' };
  }
}