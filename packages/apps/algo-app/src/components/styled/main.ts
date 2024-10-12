export namespace MainPage {
  export const Centering = styled('div')`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at 50% 50%,
      rgb(255 255 255) 0%,
      rgb(202 202 202) 100%
    );
  `;

  const padding = {
    y: 40,
    x: 20,
  } as const;

  export const FormRect = styled('div')`
    border-radius: 10px;
    background-color: white;
    filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));
    padding: ${padding.y}px ${padding.x}px;
  `;

  /**
   * FormRect の max-width / max-height を 90vw / 90vh にする調整
   * スクロールバーをBodyWrapperの方につけるためこのようにしている
   */
  export const BodyWrapper = styled('div')`
    max-height: calc(90vh - ${2 * padding.y}px);
    max-width: calc(90vw - ${2 * padding.x}px);
    overflow-y: auto;
    overflow-x: auto;
  `;

  export const BodyStyled = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  export const Block = styled('div')`
    margin: 10px;
    padding: 10px;
  `;

  export const Label = styled('div')`
    font-weight: bold;
    margin-bottom: 5px;
  `;

  export const ButtonWrapper = styled('div')`
    margin: 10px;
  `;
}
