/**
 * O jsdom não tem showModal() nem close() no <dialog>. Simula só o que o navegador faz e o app usa:
 * abrir (atributo open), Esc dispara "cancel" e fecha, e fechar dispara "close".
 */
export function simularDialogo() {
  const prototipo = HTMLDialogElement.prototype

  function fecharComEsc(this: HTMLDialogElement, evento: KeyboardEvent) {
    if (evento.key !== 'Escape') return
    if (this.dispatchEvent(new Event('cancel', { cancelable: true }))) this.close()
  }

  prototipo.showModal = function (this: HTMLDialogElement) {
    if (this.open) throw new DOMException('O diálogo já está aberto.', 'InvalidStateError')
    this.open = true
    this.addEventListener('keydown', fecharComEsc)
  }

  prototipo.close = function (this: HTMLDialogElement) {
    if (!this.open) return
    this.open = false
    this.removeEventListener('keydown', fecharComEsc)
    this.dispatchEvent(new Event('close'))
  }
}
