// localStorage può lanciare (quota piena, modalità privata, storage
// disabilitato): salvare è un di più, l'app deve continuare a funzionare
export function salvaLocale(chiave, valore) {
  try {
    localStorage.setItem(chiave, valore)
  } catch {
    // ignorato di proposito
  }
}
