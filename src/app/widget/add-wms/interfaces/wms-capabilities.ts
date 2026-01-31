export interface WMSCapabilities {
  Service?: {
    Name?: string;
    Title?: string;
    Abstract?: string;
    KeywordList?: { Keyword?: string[] };
    OnlineResource?: { 'xlink:href'?: string };
    ContactInformation?: {
      ContactPersonPrimary?: {
        ContactPerson?: string;
        ContactOrganization?: string;
      };
      ContactPosition?: string;
      ContactAddress?: {
        AddressType?: string;
        Address?: string;
        City?: string;
        StateOrProvince?: string;
        PostCode?: string;
        Country?: string;
      };
      ContactVoiceTelephone?: string;
      ContactFacsimileTelephone?: string;
      ContactElectronicMailAddress?: string;
    };
  };
  Capability?: {
    Request?: {
      GetCapabilities?: WMSRequest;
      GetMap?: WMSRequest;
      GetFeatureInfo?: WMSRequest;
    };
    Exception?: { Format?: string[] };
    Layer?: WMSLayer;
  };
}

export interface WMSRequest {
  Format?: string[];
  DCPType?: {
    HTTP?: {
      Get?: { OnlineResource?: { 'xlink:href'?: string } };
      Post?: { OnlineResource?: { 'xlink:href'?: string } };
    };
  }[];
}

export interface WMSLayer {
  Name?: string;
  Title?: string;
  Abstract?: string;
  CRS?: string[]; // En WMS 1.3.0 es CRS, en 1.1.1 es SRS
  SRS?: string[];
  BoundingBox?: {
    CRS?: string;
    SRS?: string;
    MinX?: number;
    MinY?: number;
    MaxX?: number;
    MaxY?: number;
  }[];
  Style?: {
    Name?: string;
    Title?: string;
    Abstract?: string;
    LegendURL?: {
      Format?: string;
      OnlineResource?: { 'xlink:href'?: string };
      Width?: number;
      Height?: number;
    }[];
  }[];
  Layer?: WMSLayer[]; // Para capas anidadas
}
