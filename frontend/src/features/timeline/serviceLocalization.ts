export interface DescribedService {
  name: string;
  description?: string | null;
}

export const getLocalizedServiceDescription = (
  service: DescribedService,
  language: string
): string => {
  const isEn = language.startsWith('en');
  const name = service.name.toLowerCase();

  if (name.includes('balayage')) {
    return isEn
      ? 'Multi-dimensional brush lightening with customized toning and blowout finish.'
      : 'Wielowymiarowe rozjaśnianie techniką pędzla z tonowaniem i wykończeniem.';
  }

  if (name.includes('damskie') || name.includes('women')) {
    return isEn
      ? 'Signature tailored haircut crafted to facial geometry and natural hair texture.'
      : 'Personalizowana forma dopasowana do owalu twarzy i tekstury włosa.';
  }

  if (name.includes('męskie') || name.includes('meskie') || name.includes('men') || name.includes('brody')) {
    return isEn
      ? 'Classic precision cut, straight-razor contouring, and nourishing argan oil finish.'
      : 'Klasyczna architektura cięcia, konturowanie brzytwą i olejek arganowy.';
  }

  if (name.includes('keratyn') || name.includes('keratin') || name.includes('odbudowy') || name.includes('reconstruction')) {
    return isEn
      ? 'Deep keratin reconstructive treatment for damaged hair with therapeutic steam hydration.'
      : 'Głęboka rekonstrukcja zniszczonych pasm z kompresem parowym.';
  }

  if (name.includes('tonowanie') || name.includes('toning') || name.includes('połysk') || name.includes('shine')) {
    return isEn
      ? 'Shade refresh, cuticle sealing, and high-gloss mirror shine finish.'
      : 'Odświeżenie odcienia, domknięcie łuski i lustrzany blask.';
  }

  if (name.includes('scalp') || name.includes('detox') || name.includes('oczyszczający') || name.includes('peeling')) {
    return isEn
      ? 'Scalp acid exfoliation treatment paired with lymphatic drainage massage.'
      : 'Peeling kwasowy skóry głowy z masażem drenującym.';
  }

  return service.description || (isEn ? 'Signature Lumé atelier experience' : 'Autorski rytuał Lumé atelier');
};
