export interface EedBaseResponse {
  fehlernummer: string;
  fehlermeldung?: string;
  neuesessionid?: string;
}

export interface ProductSummary {
  artikelnummer: string;
  artikelbezeichnung: string;
  ekpreis: string;
  lieferzeit?: string;
  lieferzeit_in_tagen?: number;
  bestellbar?: string;
  bild?: string;
  thumbnailurl?: string;
  artikelhersteller?: string;
  vgruppenname?: string;
  EAN?: string;
}

export interface ProductSearchResponse extends EedBaseResponse {
  treffer?: Record<string, ProductSummary>;
  gesamtanzahltreffer?: string;
  anzahlseiten?: number;
  seite?: number;
  trefferproseite?: string;
}

export interface ProductGroup {
  vgruppenid: string;
  vgruppenname: string;
}

export interface ProductDetail extends ProductSummary {
  gewicht?: string;
  artikeldaten?: Record<string, string>;
  artikelmerkmal?: string[];
  vgruppenbaum?: ProductGroup[];
  energielabel_gross?: string;
  disposalcost?: string;
  ersatzartikel?: string;
  storno_moeglich?: string;
  herstelleradresse?: {
    hersteller?: ManufacturerInfo;
    importeur?: ManufacturerInfo;
  };
}

export interface ManufacturerInfo {
  name?: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
  land?: string;
  email?: string;
  internet?: string;
}

export interface ProductDetailResponse extends ProductDetail, EedBaseResponse {}

export interface NormalizedProduct {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  imageUrl?: string;
  hasImage: boolean;
  manufacturer?: string;
  category?: string;
  deliveryTime?: string;
  available: boolean;
}

export interface NormalizedProductDetail extends NormalizedProduct {
  weight?: string;
  ean?: string;
  attributes?: Record<string, string>;
  categoryPath?: ProductGroup[];
  disposalCost?: string;
  manufacturerAddress?: ManufacturerInfo;
  importerAddress?: ManufacturerInfo;
}
