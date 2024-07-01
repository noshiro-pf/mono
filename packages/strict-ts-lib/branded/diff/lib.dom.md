```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 /////////////////////////////
 /// Window APIs
@@ -126,9 +127,9 @@ interface AudioTimestamp {
 interface AudioWorkletNodeOptions extends AudioNodeOptions {
   numberOfInputs?: number;
   numberOfOutputs?: number;
-  outputChannelCount?: number[];
+  outputChannelCount?: readonly number[];
   parameterData?: Record<string, number>;
-  processorOptions?: any;
+  processorOptions?: unknown;
 }
 
 interface AuthenticationExtensionsClientInputs {
@@ -270,8 +271,8 @@ interface ConstrainBooleanParameters {
 }
 
 interface ConstrainDOMStringParameters {
-  exact?: string | string[];
-  ideal?: string | string[];
+  exact?: string | readonly string[];
+  ideal?: string | readonly string[];
 }
 
 interface ConstrainDoubleRange extends DoubleRange {
@@ -309,7 +310,7 @@ interface CryptoKeyPair {
   publicKey: CryptoKey;
 }
 
-interface CustomEventInit<T = any> extends EventInit {
+interface CustomEventInit<T = unknown> extends EventInit {
   detail?: T;
 }
 
@@ -473,7 +474,7 @@ interface EncodedVideoChunkMetadata {
 
 interface ErrorEventInit extends EventInit {
   colno?: number;
-  error?: any;
+  error?: unknown;
   filename?: string;
   lineno?: number;
   message?: string;
@@ -556,7 +557,7 @@ interface FontFaceDescriptors {
 }
 
 interface FontFaceSetLoadEventInit extends EventInit {
-  fontfaces?: FontFace[];
+  fontfaces?: readonly FontFace[];
 }
 
 interface FormDataEventInit extends EventInit {
@@ -632,7 +633,7 @@ interface IDBIndexParameters {
 
 interface IDBObjectStoreParameters {
   autoIncrement?: boolean;
-  keyPath?: string | string[] | null;
+  keyPath?: string | readonly string[] | null;
 }
 
 interface IDBTransactionOptions {
@@ -645,8 +646,8 @@ interface IDBVersionChangeEventInit extends EventInit {
 }
 
 interface IIRFilterOptions extends AudioNodeOptions {
-  feedback: number[];
-  feedforward: number[];
+  feedback: readonly number[];
+  feedforward: readonly number[];
 }
 
 interface IdleRequestOptions {
@@ -684,7 +685,7 @@ interface InputEventInit extends UIEventInit {
   dataTransfer?: DataTransfer | null;
   inputType?: string;
   isComposing?: boolean;
-  targetRanges?: StaticRange[];
+  targetRanges?: readonly StaticRange[];
 }
 
 interface IntersectionObserverEntryInit {
@@ -700,7 +701,7 @@ interface IntersectionObserverEntryInit {
 interface IntersectionObserverInit {
   root?: Element | Document | null;
   rootMargin?: string;
-  threshold?: number | number[];
+  threshold?: number | readonly number[];
 }
 
 interface JsonWebKey {
@@ -712,10 +713,10 @@ interface JsonWebKey {
   e?: string;
   ext?: boolean;
   k?: string;
-  key_ops?: string[];
+  key_ops?: readonly string[];
   kty?: string;
   n?: string;
-  oth?: RsaOtherPrimesInfo[];
+  oth?: readonly RsaOtherPrimesInfo[];
   p?: string;
   q?: string;
   qi?: string;
@@ -765,8 +766,8 @@ interface LockInfo {
 }
 
 interface LockManagerSnapshot {
-  held?: LockInfo[];
-  pending?: LockInfo[];
+  held?: readonly LockInfo[];
+  pending?: readonly LockInfo[];
 }
 
 interface LockOptions {
@@ -837,13 +838,13 @@ interface MediaKeyMessageEventInit extends EventInit {
 }
 
 interface MediaKeySystemConfiguration {
-  audioCapabilities?: MediaKeySystemMediaCapability[];
+  audioCapabilities?: readonly MediaKeySystemMediaCapability[];
   distinctiveIdentifier?: MediaKeysRequirement;
-  initDataTypes?: string[];
+  initDataTypes?: readonly string[];
   label?: string;
   persistentState?: MediaKeysRequirement;
-  sessionTypes?: string[];
-  videoCapabilities?: MediaKeySystemMediaCapability[];
+  sessionTypes?: readonly string[];
+  videoCapabilities?: readonly MediaKeySystemMediaCapability[];
 }
 
 interface MediaKeySystemMediaCapability {
@@ -855,7 +856,7 @@ interface MediaKeySystemMediaCapability {
 interface MediaMetadataInit {
   album?: string;
   artist?: string;
-  artwork?: MediaImage[];
+  artwork?: readonly MediaImage[];
   title?: string;
 }
 
@@ -901,16 +902,16 @@ interface MediaStreamTrackEventInit extends EventInit {
 
 interface MediaTrackCapabilities {
   aspectRatio?: DoubleRange;
-  autoGainControl?: boolean[];
+  autoGainControl?: readonly boolean[];
   channelCount?: ULongRange;
   deviceId?: string;
   displaySurface?: string;
-  echoCancellation?: boolean[];
-  facingMode?: string[];
+  echoCancellation?: readonly boolean[];
+  facingMode?: readonly string[];
   frameRate?: DoubleRange;
   groupId?: string;
   height?: ULongRange;
-  noiseSuppression?: boolean[];
+  noiseSuppression?: readonly boolean[];
   sampleRate?: ULongRange;
   sampleSize?: ULongRange;
   width?: ULongRange;
@@ -934,7 +935,7 @@ interface MediaTrackConstraintSet {
 }
 
 interface MediaTrackConstraints extends MediaTrackConstraintSet {
-  advanced?: MediaTrackConstraintSet[];
+  advanced?: readonly MediaTrackConstraintSet[];
 }
 
 interface MediaTrackSettings {
@@ -971,11 +972,11 @@ interface MediaTrackSupportedConstraints {
   width?: boolean;
 }
 
-interface MessageEventInit<T = any> extends EventInit {
+interface MessageEventInit<T = unknown> extends EventInit {
   data?: T;
   lastEventId?: string;
   origin?: string;
-  ports?: MessagePort[];
+  ports?: readonly MessagePort[];
   source?: MessageEventSource | null;
 }
 
@@ -1000,7 +1001,7 @@ interface MutationObserverInit {
    * Set to a list of attribute local names (without namespace) if not all
    * attribute mutations need to be observed and attributes is true or omitted.
    */
-  attributeFilter?: string[];
+  attributeFilter?: readonly string[];
   /**
    * Set to true if attributes is true or omitted and target's attribute value
    * before the mutation needs to be recorded.
@@ -1038,7 +1039,7 @@ interface NavigationPreloadState {
 interface NotificationOptions {
   badge?: string;
   body?: string;
-  data?: any;
+  data?: unknown;
   dir?: NotificationDirection;
   icon?: string;
   lang?: string;
@@ -1103,8 +1104,8 @@ interface PaymentCurrencyAmount {
 }
 
 interface PaymentDetailsBase {
-  displayItems?: PaymentItem[];
-  modifiers?: PaymentDetailsModifier[];
+  displayItems?: readonly PaymentItem[];
+  modifiers?: readonly PaymentDetailsModifier[];
 }
 
 interface PaymentDetailsInit extends PaymentDetailsBase {
@@ -1113,14 +1114,14 @@ interface PaymentDetailsInit extends PaymentDetailsBase {
 }
 
 interface PaymentDetailsModifier {
-  additionalDisplayItems?: PaymentItem[];
-  data?: any;
+  additionalDisplayItems?: readonly PaymentItem[];
+  data?: unknown;
   supportedMethods: string;
   total?: PaymentItem;
 }
 
 interface PaymentDetailsUpdate extends PaymentDetailsBase {
-  paymentMethodErrors?: any;
+  paymentMethodErrors?: unknown;
   total?: PaymentItem;
 }
 
@@ -1131,12 +1132,12 @@ interface PaymentItem {
 }
 
 interface PaymentMethodChangeEventInit extends PaymentRequestUpdateEventInit {
-  methodDetails?: any;
+  methodDetails?: unknown;
   methodName?: string;
 }
 
 interface PaymentMethodData {
-  data?: any;
+  data?: unknown;
   supportedMethods: string;
 }
 
@@ -1144,7 +1145,7 @@ interface PaymentRequestUpdateEventInit extends EventInit {}
 
 interface PaymentValidationErrors {
   error?: string;
-  paymentMethod?: any;
+  paymentMethod?: unknown;
 }
 
 interface Pbkdf2Params extends Algorithm {
@@ -1154,12 +1155,12 @@ interface Pbkdf2Params extends Algorithm {
 }
 
 interface PerformanceMarkOptions {
-  detail?: any;
+  detail?: unknown;
   startTime?: DOMHighResTimeStamp;
 }
 
 interface PerformanceMeasureOptions {
-  detail?: any;
+  detail?: unknown;
   duration?: DOMHighResTimeStamp;
   end?: string | DOMHighResTimeStamp;
   start?: string | DOMHighResTimeStamp;
@@ -1167,7 +1168,7 @@ interface PerformanceMeasureOptions {
 
 interface PerformanceObserverInit {
   buffered?: boolean;
-  entryTypes?: string[];
+  entryTypes?: readonly string[];
   type?: string;
 }
 
@@ -1176,8 +1177,8 @@ interface PeriodicWaveConstraints {
 }
 
 interface PeriodicWaveOptions extends PeriodicWaveConstraints {
-  imag?: number[] | Float32Array;
-  real?: number[] | Float32Array;
+  imag?: readonly number[] | Float32Array;
+  real?: readonly number[] | Float32Array;
 }
 
 interface PermissionDescriptor {
@@ -1194,12 +1195,12 @@ interface PlaneLayout {
 }
 
 interface PointerEventInit extends MouseEventInit {
-  coalescedEvents?: PointerEvent[];
+  coalescedEvents?: readonly PointerEvent[];
   height?: number;
   isPrimary?: boolean;
   pointerId?: number;
   pointerType?: string;
-  predictedEvents?: PointerEvent[];
+  predictedEvents?: readonly PointerEvent[];
   pressure?: number;
   tangentialPressure?: number;
   tiltX?: number;
@@ -1209,7 +1210,7 @@ interface PointerEventInit extends MouseEventInit {
 }
 
 interface PopStateEventInit extends EventInit {
-  state?: any;
+  state?: unknown;
 }
 
 interface PositionOptions {
@@ -1225,8 +1226,8 @@ interface ProgressEventInit extends EventInit {
 }
 
 interface PromiseRejectionEventInit extends EventInit {
-  promise: Promise<any>;
-  reason?: any;
+  promise: Promise<unknown>;
+  reason?: unknown;
 }
 
 interface PropertyDefinition {
@@ -1237,12 +1238,12 @@ interface PropertyDefinition {
 }
 
 interface PropertyIndexedKeyframes {
-  composite?: CompositeOperationOrAuto | CompositeOperationOrAuto[];
-  easing?: string | string[];
+  composite?: CompositeOperationOrAuto | readonly CompositeOperationOrAuto[];
+  easing?: string | readonly string[];
   offset?: number | (number | null)[];
   [property: string]:
     | string
-    | string[]
+    | readonly string[]
     | number
     | null
     | (number | null)[]
@@ -1253,9 +1254,9 @@ interface PublicKeyCredentialCreationOptions {
   attestation?: AttestationConveyancePreference;
   authenticatorSelection?: AuthenticatorSelectionCriteria;
   challenge: BufferSource;
-  excludeCredentials?: PublicKeyCredentialDescriptor[];
+  excludeCredentials?: readonly PublicKeyCredentialDescriptor[];
   extensions?: AuthenticationExtensionsClientInputs;
-  pubKeyCredParams: PublicKeyCredentialParameters[];
+  pubKeyCredParams: readonly PublicKeyCredentialParameters[];
   rp: PublicKeyCredentialRpEntity;
   timeout?: number;
   user: PublicKeyCredentialUserEntity;
@@ -1263,7 +1264,7 @@ interface PublicKeyCredentialCreationOptions {
 
 interface PublicKeyCredentialDescriptor {
   id: BufferSource;
-  transports?: AuthenticatorTransport[];
+  transports?: readonly AuthenticatorTransport[];
   type: PublicKeyCredentialType;
 }
 
@@ -1277,7 +1278,7 @@ interface PublicKeyCredentialParameters {
 }
 
 interface PublicKeyCredentialRequestOptions {
-  allowCredentials?: PublicKeyCredentialDescriptor[];
+  allowCredentials?: readonly PublicKeyCredentialDescriptor[];
   challenge: BufferSource;
   extensions?: AuthenticationExtensionsClientInputs;
   rpId?: string;
@@ -1305,7 +1306,7 @@ interface PushSubscriptionOptionsInit {
   userVisibleOnly?: boolean;
 }
 
-interface QueuingStrategy<T = any> {
+interface QueuingStrategy<T = unknown> {
   highWaterMark?: number;
   size?: QueuingStrategySize<T>;
 }
@@ -1330,9 +1331,9 @@ interface RTCCertificateExpiration {
 
 interface RTCConfiguration {
   bundlePolicy?: RTCBundlePolicy;
-  certificates?: RTCCertificate[];
+  certificates?: readonly RTCCertificate[];
   iceCandidatePoolSize?: number;
-  iceServers?: RTCIceServer[];
+  iceServers?: readonly RTCIceServer[];
   iceTransportPolicy?: RTCIceTransportPolicy;
   rtcpMuxPolicy?: RTCRtcpMuxPolicy;
 }
@@ -1360,15 +1361,15 @@ interface RTCDtlsFingerprint {
 }
 
 interface RTCEncodedAudioFrameMetadata {
-  contributingSources?: number[];
+  contributingSources?: readonly number[];
   payloadType?: number;
   sequenceNumber?: number;
   synchronizationSource?: number;
 }
 
 interface RTCEncodedVideoFrameMetadata {
-  contributingSources?: number[];
-  dependencies?: number[];
+  contributingSources?: readonly number[];
+  dependencies?: readonly number[];
   frameId?: number;
   height?: number;
   payloadType?: number;
@@ -1426,7 +1427,7 @@ interface RTCIceCandidatePairStats extends RTCStats {
 
 interface RTCIceServer {
   credential?: string;
-  urls: string | string[];
+  urls: string | readonly string[];
   username?: string;
 }
 
@@ -1534,8 +1535,8 @@ interface RTCRtcpParameters {
 }
 
 interface RTCRtpCapabilities {
-  codecs: RTCRtpCodecCapability[];
-  headerExtensions: RTCRtpHeaderExtensionCapability[];
+  codecs: readonly RTCRtpCodecCapability[];
+  headerExtensions: readonly RTCRtpHeaderExtensionCapability[];
 }
 
 interface RTCRtpCodec {
@@ -1582,8 +1583,8 @@ interface RTCRtpHeaderExtensionParameters {
 }
 
 interface RTCRtpParameters {
-  codecs: RTCRtpCodecParameters[];
-  headerExtensions: RTCRtpHeaderExtensionParameters[];
+  codecs: readonly RTCRtpCodecParameters[];
+  headerExtensions: readonly RTCRtpHeaderExtensionParameters[];
   rtcp: RTCRtcpParameters;
 }
 
@@ -1591,7 +1592,7 @@ interface RTCRtpReceiveParameters extends RTCRtpParameters {}
 
 interface RTCRtpSendParameters extends RTCRtpParameters {
   degradationPreference?: RTCDegradationPreference;
-  encodings: RTCRtpEncodingParameters[];
+  encodings: readonly RTCRtpEncodingParameters[];
   transactionId: string;
 }
 
@@ -1606,8 +1607,8 @@ interface RTCRtpSynchronizationSource extends RTCRtpContributingSource {}
 
 interface RTCRtpTransceiverInit {
   direction?: RTCRtpTransceiverDirection;
-  sendEncodings?: RTCRtpEncodingParameters[];
-  streams?: MediaStream[];
+  sendEncodings?: readonly RTCRtpEncodingParameters[];
+  streams?: readonly MediaStream[];
 }
 
 interface RTCSentRtpStreamStats extends RTCRtpStreamStats {
@@ -1630,7 +1631,7 @@ interface RTCStats {
 
 interface RTCTrackEventInit extends EventInit {
   receiver: RTCRtpReceiver;
-  streams?: MediaStream[];
+  streams?: readonly MediaStream[];
   track: MediaStreamTrack;
   transceiver: RTCRtpTransceiver;
 }
@@ -1671,7 +1672,7 @@ interface ReadableStreamReadValueResult<T> {
   value: T;
 }
 
-interface ReadableWritablePair<R = any, W = any> {
+interface ReadableWritablePair<R = unknown, W = unknown> {
   readable: ReadableStream<R>;
   /**
    * Provides a convenient, chainable way of piping this readable stream through
@@ -1693,7 +1694,7 @@ interface RegistrationOptions {
 
 interface ReportingObserverOptions {
   buffered?: boolean;
-  types?: string[];
+  types?: readonly string[];
 }
 
 interface RequestInit {
@@ -1838,7 +1839,7 @@ interface ShadowRootInit {
 }
 
 interface ShareData {
-  files?: File[];
+  files?: readonly File[];
   text?: string;
   title?: string;
   url?: string;
@@ -1926,7 +1927,7 @@ interface StreamPipeOptions {
 }
 
 interface StructuredSerializeOptions {
-  transfer?: Transferable[];
+  transfer?: readonly Transferable[];
 }
 
 interface SubmitEventInit extends EventInit {
@@ -1953,9 +1954,9 @@ interface ToggleEventInit extends EventInit {
 }
 
 interface TouchEventInit extends EventModifierInit {
-  changedTouches?: Touch[];
-  targetTouches?: Touch[];
-  touches?: Touch[];
+  changedTouches?: readonly Touch[];
+  targetTouches?: readonly Touch[];
+  touches?: readonly Touch[];
 }
 
 interface TouchInit {
@@ -1980,7 +1981,7 @@ interface TrackEventInit extends EventInit {
   track?: TextTrack | null;
 }
 
-interface Transformer<I = any, O = any> {
+interface Transformer<I = unknown, O = unknown> {
   flush?: TransformerFlushCallback<O>;
   readableType?: undefined;
   start?: TransformerStartCallback<O>;
@@ -2010,20 +2011,20 @@ interface UnderlyingByteSource {
   autoAllocateChunkSize?: number;
   cancel?: UnderlyingSourceCancelCallback;
   pull?: (controller: ReadableByteStreamController) => void | PromiseLike<void>;
-  start?: (controller: ReadableByteStreamController) => any;
+  start?: (controller: ReadableByteStreamController) => unknown;
   type: 'bytes';
 }
 
-interface UnderlyingDefaultSource<R = any> {
+interface UnderlyingDefaultSource<R = unknown> {
   cancel?: UnderlyingSourceCancelCallback;
   pull?: (
     controller: ReadableStreamDefaultController<R>,
   ) => void | PromiseLike<void>;
-  start?: (controller: ReadableStreamDefaultController<R>) => any;
+  start?: (controller: ReadableStreamDefaultController<R>) => unknown;
   type?: undefined;
 }
 
-interface UnderlyingSink<W = any> {
+interface UnderlyingSink<W = unknown> {
   abort?: UnderlyingSinkAbortCallback;
   close?: UnderlyingSinkCloseCallback;
   start?: UnderlyingSinkStartCallback;
@@ -2031,7 +2032,7 @@ interface UnderlyingSink<W = any> {
   write?: UnderlyingSinkWriteCallback<W>;
 }
 
-interface UnderlyingSource<R = any> {
+interface UnderlyingSource<R = unknown> {
   autoAllocateChunkSize?: number;
   cancel?: UnderlyingSourceCancelCallback;
   pull?: UnderlyingSourcePullCallback<R>;
@@ -2131,7 +2132,7 @@ interface VideoFrameBufferInit {
   displayWidth?: number;
   duration?: number;
   format: VideoPixelFormat;
-  layout?: PlaneLayout[];
+  layout?: readonly PlaneLayout[];
   timestamp: number;
   visibleRect?: DOMRectInit;
 }
@@ -2150,7 +2151,7 @@ interface VideoFrameCallbackMetadata {
 }
 
 interface VideoFrameCopyToOptions {
-  layout?: PlaneLayout[];
+  layout?: readonly PlaneLayout[];
   rect?: DOMRectInit;
 }
 
@@ -2164,7 +2165,7 @@ interface VideoFrameInit {
 }
 
 interface WaveShaperOptions extends AudioNodeOptions {
-  curve?: number[] | Float32Array;
+  curve?: readonly number[] | Float32Array;
   oversample?: OverSampleType;
 }
 
@@ -2203,7 +2204,7 @@ interface WebTransportOptions {
   allowPooling?: boolean;
   congestionControl?: WebTransportCongestionControl;
   requireUnreliable?: boolean;
-  serverCertificateHashes?: WebTransportHash[];
+  serverCertificateHashes?: readonly WebTransportHash[];
 }
 
 interface WebTransportSendStreamOptions {
@@ -2240,7 +2241,7 @@ interface WriteParams {
 
 type NodeFilter = ((node: Node) => number) | { acceptNode(node: Node): number };
 
-declare var NodeFilter: {
+declare const NodeFilter: {
   readonly FILTER_ACCEPT: 1;
   readonly FILTER_REJECT: 2;
   readonly FILTER_SKIP: 3;
@@ -2512,10 +2513,10 @@ interface AbortController {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AbortController/abort)
    */
-  abort(reason?: any): void;
+  abort(reason?: unknown): void;
 }
 
-declare var AbortController: {
+declare const AbortController: {
   prototype: AbortController;
   new (): AbortController;
 };
@@ -2543,12 +2544,12 @@ interface AbortSignal extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/abort_event)
    */
-  onabort: ((this: AbortSignal, ev: Event) => any) | null;
+  onabort: ((this: AbortSignal, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/reason)
    */
-  readonly reason: any;
+  readonly reason: unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/throwIfAborted)
@@ -2556,7 +2557,7 @@ interface AbortSignal extends EventTarget {
   throwIfAborted(): void;
   addEventListener<K extends keyof AbortSignalEventMap>(
     type: K,
-    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
+    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -2566,7 +2567,7 @@ interface AbortSignal extends EventTarget {
   ): void;
   removeEventListener<K extends keyof AbortSignalEventMap>(
     type: K,
-    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
+    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -2576,14 +2577,14 @@ interface AbortSignal extends EventTarget {
   ): void;
 }
 
-declare var AbortSignal: {
+declare const AbortSignal: {
   prototype: AbortSignal;
   new (): AbortSignal;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/abort_static)
    */
-  abort(reason?: any): AbortSignal;
+  abort(reason?: unknown): AbortSignal;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/timeout_static)
@@ -2630,7 +2631,7 @@ interface AbstractRange {
   readonly startOffset: number;
 }
 
-declare var AbstractRange: {
+declare const AbstractRange: {
   prototype: AbstractRange;
   new (): AbstractRange;
 };
@@ -2644,10 +2645,10 @@ interface AbstractWorker {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorker/error_event)
    */
-  onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null;
+  onerror: ((this: AbstractWorker, ev: ErrorEvent) => unknown) | null;
   addEventListener<K extends keyof AbstractWorkerEventMap>(
     type: K,
-    listener: (this: AbstractWorker, ev: AbstractWorkerEventMap[K]) => any,
+    listener: (this: AbstractWorker, ev: AbstractWorkerEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -2657,7 +2658,7 @@ interface AbstractWorker {
   ): void;
   removeEventListener<K extends keyof AbstractWorkerEventMap>(
     type: K,
-    listener: (this: AbstractWorker, ev: AbstractWorkerEventMap[K]) => any,
+    listener: (this: AbstractWorker, ev: AbstractWorkerEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -2723,7 +2724,7 @@ interface AnalyserNode extends AudioNode {
   getFloatTimeDomainData(array: Float32Array): void;
 }
 
-declare var AnalyserNode: {
+declare const AnalyserNode: {
   prototype: AnalyserNode;
   new (context: BaseAudioContext, options?: AnalyserOptions): AnalyserNode;
 };
@@ -2731,14 +2732,14 @@ declare var AnalyserNode: {
 interface Animatable {
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animate) */
   animate(
-    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
+    keyframes: readonly Keyframe[] | PropertyIndexedKeyframes | null,
     options?: number | KeyframeAnimationOptions,
   ): Animation;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/getAnimations)
    */
-  getAnimations(options?: GetAnimationsOptions): Animation[];
+  getAnimations(options?: GetAnimationsOptions): readonly Animation[];
 }
 
 interface AnimationEventMap {
@@ -2770,17 +2771,17 @@ interface Animation extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Animation/cancel_event)
    */
-  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
+  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Animation/finish_event)
    */
-  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null;
+  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Animation/remove_event)
    */
-  onremove: ((this: Animation, ev: Event) => any) | null;
+  onremove: ((this: Animation, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Animation/pending)
@@ -2849,7 +2850,7 @@ interface Animation extends EventTarget {
   updatePlaybackRate(playbackRate: number): void;
   addEventListener<K extends keyof AnimationEventMap>(
     type: K,
-    listener: (this: Animation, ev: AnimationEventMap[K]) => any,
+    listener: (this: Animation, ev: AnimationEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -2859,7 +2860,7 @@ interface Animation extends EventTarget {
   ): void;
   removeEventListener<K extends keyof AnimationEventMap>(
     type: K,
-    listener: (this: Animation, ev: AnimationEventMap[K]) => any,
+    listener: (this: Animation, ev: AnimationEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -2869,7 +2870,7 @@ interface Animation extends EventTarget {
   ): void;
 }
 
-declare var Animation: {
+declare const Animation: {
   prototype: Animation;
   new (
     effect?: AnimationEffect | null,
@@ -2896,7 +2897,7 @@ interface AnimationEffect {
   updateTiming(timing?: OptionalEffectTiming): void;
 }
 
-declare var AnimationEffect: {
+declare const AnimationEffect: {
   prototype: AnimationEffect;
   new (): AnimationEffect;
 };
@@ -2924,7 +2925,7 @@ interface AnimationEvent extends Event {
   readonly pseudoElement: string;
 }
 
-declare var AnimationEvent: {
+declare const AnimationEvent: {
   prototype: AnimationEvent;
   new (
     type: string,
@@ -2962,7 +2963,7 @@ interface AnimationPlaybackEvent extends Event {
   readonly timelineTime: CSSNumberish | null;
 }
 
-declare var AnimationPlaybackEvent: {
+declare const AnimationPlaybackEvent: {
   prototype: AnimationPlaybackEvent;
   new (
     type: string,
@@ -2979,7 +2980,7 @@ interface AnimationTimeline {
   readonly currentTime: CSSNumberish | null;
 }
 
-declare var AnimationTimeline: {
+declare const AnimationTimeline: {
   prototype: AnimationTimeline;
   new (): AnimationTimeline;
 };
@@ -3020,7 +3021,7 @@ interface Attr extends Node {
   value: string;
 }
 
-declare var Attr: {
+declare const Attr: {
   prototype: Attr;
   new (): Attr;
 };
@@ -3079,7 +3080,7 @@ interface AudioBuffer {
   getChannelData(channel: number): Float32Array;
 }
 
-declare var AudioBuffer: {
+declare const AudioBuffer: {
   prototype: AudioBuffer;
   new (options: AudioBufferOptions): AudioBuffer;
 };
@@ -3135,7 +3136,7 @@ interface AudioBufferSourceNode extends AudioScheduledSourceNode {
     listener: (
       this: AudioBufferSourceNode,
       ev: AudioScheduledSourceNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -3148,7 +3149,7 @@ interface AudioBufferSourceNode extends AudioScheduledSourceNode {
     listener: (
       this: AudioBufferSourceNode,
       ev: AudioScheduledSourceNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -3158,7 +3159,7 @@ interface AudioBufferSourceNode extends AudioScheduledSourceNode {
   ): void;
 }
 
-declare var AudioBufferSourceNode: {
+declare const AudioBufferSourceNode: {
   prototype: AudioBufferSourceNode;
   new (
     context: BaseAudioContext,
@@ -3222,7 +3223,7 @@ interface AudioContext extends BaseAudioContext {
   suspend(): Promise<void>;
   addEventListener<K extends keyof BaseAudioContextEventMap>(
     type: K,
-    listener: (this: AudioContext, ev: BaseAudioContextEventMap[K]) => any,
+    listener: (this: AudioContext, ev: BaseAudioContextEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -3232,7 +3233,7 @@ interface AudioContext extends BaseAudioContext {
   ): void;
   removeEventListener<K extends keyof BaseAudioContextEventMap>(
     type: K,
-    listener: (this: AudioContext, ev: BaseAudioContextEventMap[K]) => any,
+    listener: (this: AudioContext, ev: BaseAudioContextEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -3242,7 +3243,7 @@ interface AudioContext extends BaseAudioContext {
   ): void;
 }
 
-declare var AudioContext: {
+declare const AudioContext: {
   prototype: AudioContext;
   new (contextOptions?: AudioContextOptions): AudioContext;
 };
@@ -3264,7 +3265,7 @@ interface AudioDestinationNode extends AudioNode {
   readonly maxChannelCount: number;
 }
 
-declare var AudioDestinationNode: {
+declare const AudioDestinationNode: {
   prototype: AudioDestinationNode;
   new (): AudioDestinationNode;
 };
@@ -3346,7 +3347,7 @@ interface AudioListener {
   setPosition(x: number, y: number, z: number): void;
 }
 
-declare var AudioListener: {
+declare const AudioListener: {
   prototype: AudioListener;
   new (): AudioListener;
 };
@@ -3411,7 +3412,7 @@ interface AudioNode extends EventTarget {
   disconnect(destinationParam: AudioParam, output: number): void;
 }
 
-declare var AudioNode: {
+declare const AudioNode: {
   prototype: AudioNode;
   new (): AudioNode;
 };
@@ -3487,13 +3488,13 @@ interface AudioParam {
    * Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/setValueCurveAtTime)
    */
   setValueCurveAtTime(
-    values: number[] | Float32Array,
+    values: readonly number[] | Float32Array,
     startTime: number,
     duration: number,
   ): AudioParam;
 }
 
-declare var AudioParam: {
+declare const AudioParam: {
   prototype: AudioParam;
   new (): AudioParam;
 };
@@ -3502,11 +3503,11 @@ declare var AudioParam: {
 interface AudioParamMap {
   forEach(
     callbackfn: (value: AudioParam, key: string, parent: AudioParamMap) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var AudioParamMap: {
+declare const AudioParamMap: {
   prototype: AudioParamMap;
   new (): AudioParamMap;
 };
@@ -3547,7 +3548,7 @@ interface AudioProcessingEvent extends Event {
 }
 
 /** @deprecated */
-declare var AudioProcessingEvent: {
+declare const AudioProcessingEvent: {
   prototype: AudioProcessingEvent;
   new (
     type: string,
@@ -3568,7 +3569,7 @@ interface AudioScheduledSourceNode extends AudioNode {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AudioScheduledSourceNode/ended_event)
    */
-  onended: ((this: AudioScheduledSourceNode, ev: Event) => any) | null;
+  onended: ((this: AudioScheduledSourceNode, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AudioScheduledSourceNode/start)
@@ -3584,7 +3585,7 @@ interface AudioScheduledSourceNode extends AudioNode {
     listener: (
       this: AudioScheduledSourceNode,
       ev: AudioScheduledSourceNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -3597,7 +3598,7 @@ interface AudioScheduledSourceNode extends AudioNode {
     listener: (
       this: AudioScheduledSourceNode,
       ev: AudioScheduledSourceNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -3607,7 +3608,7 @@ interface AudioScheduledSourceNode extends AudioNode {
   ): void;
 }
 
-declare var AudioScheduledSourceNode: {
+declare const AudioScheduledSourceNode: {
   prototype: AudioScheduledSourceNode;
   new (): AudioScheduledSourceNode;
 };
@@ -3619,7 +3620,7 @@ declare var AudioScheduledSourceNode: {
  */
 interface AudioWorklet extends Worklet {}
 
-declare var AudioWorklet: {
+declare const AudioWorklet: {
   prototype: AudioWorklet;
   new (): AudioWorklet;
 };
@@ -3638,7 +3639,7 @@ interface AudioWorkletNode extends AudioNode {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletNode/processorerror_event)
    */
-  onprocessorerror: ((this: AudioWorkletNode, ev: Event) => any) | null;
+  onprocessorerror: ((this: AudioWorkletNode, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletNode/parameters)
@@ -3651,7 +3652,10 @@ interface AudioWorkletNode extends AudioNode {
   readonly port: MessagePort;
   addEventListener<K extends keyof AudioWorkletNodeEventMap>(
     type: K,
-    listener: (this: AudioWorkletNode, ev: AudioWorkletNodeEventMap[K]) => any,
+    listener: (
+      this: AudioWorkletNode,
+      ev: AudioWorkletNodeEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -3661,7 +3665,10 @@ interface AudioWorkletNode extends AudioNode {
   ): void;
   removeEventListener<K extends keyof AudioWorkletNodeEventMap>(
     type: K,
-    listener: (this: AudioWorkletNode, ev: AudioWorkletNodeEventMap[K]) => any,
+    listener: (
+      this: AudioWorkletNode,
+      ev: AudioWorkletNodeEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -3671,7 +3678,7 @@ interface AudioWorkletNode extends AudioNode {
   ): void;
 }
 
-declare var AudioWorkletNode: {
+declare const AudioWorkletNode: {
   prototype: AudioWorkletNode;
   new (
     context: BaseAudioContext,
@@ -3704,7 +3711,7 @@ interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
   readonly userHandle: ArrayBuffer | null;
 }
 
-declare var AuthenticatorAssertionResponse: {
+declare const AuthenticatorAssertionResponse: {
   prototype: AuthenticatorAssertionResponse;
   new (): AuthenticatorAssertionResponse;
 };
@@ -3740,10 +3747,10 @@ interface AuthenticatorAttestationResponse extends AuthenticatorResponse {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse/getTransports)
    */
-  getTransports(): string[];
+  getTransports(): readonly string[];
 }
 
-declare var AuthenticatorAttestationResponse: {
+declare const AuthenticatorAttestationResponse: {
   prototype: AuthenticatorAttestationResponse;
   new (): AuthenticatorAttestationResponse;
 };
@@ -3762,7 +3769,7 @@ interface AuthenticatorResponse {
   readonly clientDataJSON: ArrayBuffer;
 }
 
-declare var AuthenticatorResponse: {
+declare const AuthenticatorResponse: {
   prototype: AuthenticatorResponse;
   new (): AuthenticatorResponse;
 };
@@ -3773,7 +3780,7 @@ interface BarProp {
   readonly visible: boolean;
 }
 
-declare var BarProp: {
+declare const BarProp: {
   prototype: BarProp;
   new (): BarProp;
 };
@@ -3810,7 +3817,7 @@ interface BaseAudioContext extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/statechange_event)
    */
-  onstatechange: ((this: BaseAudioContext, ev: Event) => any) | null;
+  onstatechange: ((this: BaseAudioContext, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/sampleRate)
@@ -3884,7 +3891,10 @@ interface BaseAudioContext extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createIIRFilter)
    */
-  createIIRFilter(feedforward: number[], feedback: number[]): IIRFilterNode;
+  createIIRFilter(
+    feedforward: readonly number[],
+    feedback: readonly number[],
+  ): IIRFilterNode;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createOscillator)
@@ -3900,8 +3910,8 @@ interface BaseAudioContext extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createPeriodicWave)
    */
   createPeriodicWave(
-    real: number[] | Float32Array,
-    imag: number[] | Float32Array,
+    real: readonly number[] | Float32Array,
+    imag: readonly number[] | Float32Array,
     constraints?: PeriodicWaveConstraints,
   ): PeriodicWave;
   /**
@@ -3936,7 +3946,10 @@ interface BaseAudioContext extends EventTarget {
   ): Promise<AudioBuffer>;
   addEventListener<K extends keyof BaseAudioContextEventMap>(
     type: K,
-    listener: (this: BaseAudioContext, ev: BaseAudioContextEventMap[K]) => any,
+    listener: (
+      this: BaseAudioContext,
+      ev: BaseAudioContextEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -3946,7 +3959,10 @@ interface BaseAudioContext extends EventTarget {
   ): void;
   removeEventListener<K extends keyof BaseAudioContextEventMap>(
     type: K,
-    listener: (this: BaseAudioContext, ev: BaseAudioContextEventMap[K]) => any,
+    listener: (
+      this: BaseAudioContext,
+      ev: BaseAudioContextEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -3956,7 +3972,7 @@ interface BaseAudioContext extends EventTarget {
   ): void;
 }
 
-declare var BaseAudioContext: {
+declare const BaseAudioContext: {
   prototype: BaseAudioContext;
   new (): BaseAudioContext;
 };
@@ -3967,12 +3983,12 @@ declare var BaseAudioContext: {
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BeforeUnloadEvent)
  */
-interface BeforeUnloadEvent extends Event {
+interface BeforeUnloadEvent extends Omit<Event, 'returnValue'> {
   /** @deprecated */
-  returnValue: any;
+  returnValue: unknown;
 }
 
-declare var BeforeUnloadEvent: {
+declare const BeforeUnloadEvent: {
   prototype: BeforeUnloadEvent;
   new (): BeforeUnloadEvent;
 };
@@ -4022,7 +4038,7 @@ interface BiquadFilterNode extends AudioNode {
   ): void;
 }
 
-declare var BiquadFilterNode: {
+declare const BiquadFilterNode: {
   prototype: BiquadFilterNode;
   new (
     context: BaseAudioContext,
@@ -4056,9 +4072,9 @@ interface Blob {
   text(): Promise<string>;
 }
 
-declare var Blob: {
+declare const Blob: {
   prototype: Blob;
-  new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
+  new (blobParts?: readonly BlobPart[], options?: BlobPropertyBag): Blob;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/BlobEvent) */
@@ -4072,7 +4088,7 @@ interface BlobEvent extends Event {
   readonly timecode: DOMHighResTimeStamp;
 }
 
-declare var BlobEvent: {
+declare const BlobEvent: {
   prototype: BlobEvent;
   new (type: string, eventInitDict: BlobEventInit): BlobEvent;
 };
@@ -4098,7 +4114,7 @@ interface Body {
    */
   formData(): Promise<FormData>;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/json) */
-  json(): Promise<any>;
+  json(): Promise<JsonValue>;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/text) */
   text(): Promise<string>;
 }
@@ -4121,12 +4137,14 @@ interface BroadcastChannel extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel/message_event)
    */
-  onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null;
+  onmessage: ((this: BroadcastChannel, ev: MessageEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel/messageerror_event)
    */
-  onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => any) | null;
+  onmessageerror:
+    | ((this: BroadcastChannel, ev: MessageEvent) => unknown)
+    | null;
   /**
    * Closes the BroadcastChannel object, opening it up to garbage collection.
    *
@@ -4142,10 +4160,13 @@ interface BroadcastChannel extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/BroadcastChannel/postMessage)
    */
-  postMessage(message: any): void;
+  postMessage(message: unknown): void;
   addEventListener<K extends keyof BroadcastChannelEventMap>(
     type: K,
-    listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap[K]) => any,
+    listener: (
+      this: BroadcastChannel,
+      ev: BroadcastChannelEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -4155,7 +4176,10 @@ interface BroadcastChannel extends EventTarget {
   ): void;
   removeEventListener<K extends keyof BroadcastChannelEventMap>(
     type: K,
-    listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap[K]) => any,
+    listener: (
+      this: BroadcastChannel,
+      ev: BroadcastChannelEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -4165,7 +4189,7 @@ interface BroadcastChannel extends EventTarget {
   ): void;
 }
 
-declare var BroadcastChannel: {
+declare const BroadcastChannel: {
   prototype: BroadcastChannel;
   new (name: string): BroadcastChannel;
 };
@@ -4190,7 +4214,7 @@ interface ByteLengthQueuingStrategy extends QueuingStrategy<ArrayBufferView> {
   readonly size: QueuingStrategySize<ArrayBufferView>;
 }
 
-declare var ByteLengthQueuingStrategy: {
+declare const ByteLengthQueuingStrategy: {
   prototype: ByteLengthQueuingStrategy;
   new (init: QueuingStrategyInit): ByteLengthQueuingStrategy;
 };
@@ -4204,7 +4228,7 @@ declare var ByteLengthQueuingStrategy: {
  */
 interface CDATASection extends Text {}
 
-declare var CDATASection: {
+declare const CDATASection: {
   prototype: CDATASection;
   new (): CDATASection;
 };
@@ -4218,7 +4242,7 @@ interface CSSAnimation extends Animation {
   readonly animationName: string;
   addEventListener<K extends keyof AnimationEventMap>(
     type: K,
-    listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => any,
+    listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -4228,7 +4252,7 @@ interface CSSAnimation extends Animation {
   ): void;
   removeEventListener<K extends keyof AnimationEventMap>(
     type: K,
-    listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => any,
+    listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -4238,7 +4262,7 @@ interface CSSAnimation extends Animation {
   ): void;
 }
 
-declare var CSSAnimation: {
+declare const CSSAnimation: {
   prototype: CSSAnimation;
   new (): CSSAnimation;
 };
@@ -4257,7 +4281,7 @@ interface CSSConditionRule extends CSSGroupingRule {
   readonly conditionText: string;
 }
 
-declare var CSSConditionRule: {
+declare const CSSConditionRule: {
   prototype: CSSConditionRule;
   new (): CSSConditionRule;
 };
@@ -4276,7 +4300,7 @@ interface CSSContainerRule extends CSSConditionRule {
   readonly containerQuery: string;
 }
 
-declare var CSSContainerRule: {
+declare const CSSContainerRule: {
   prototype: CSSContainerRule;
   new (): CSSContainerRule;
 };
@@ -4343,7 +4367,7 @@ interface CSSCounterStyleRule extends CSSRule {
   system: string;
 }
 
-declare var CSSCounterStyleRule: {
+declare const CSSCounterStyleRule: {
   prototype: CSSCounterStyleRule;
   new (): CSSCounterStyleRule;
 };
@@ -4357,7 +4381,7 @@ interface CSSFontFaceRule extends CSSRule {
   readonly style: CSSStyleDeclaration;
 }
 
-declare var CSSFontFaceRule: {
+declare const CSSFontFaceRule: {
   prototype: CSSFontFaceRule;
   new (): CSSFontFaceRule;
 };
@@ -4374,7 +4398,7 @@ interface CSSFontFeatureValuesRule extends CSSRule {
   fontFamily: string;
 }
 
-declare var CSSFontFeatureValuesRule: {
+declare const CSSFontFeatureValuesRule: {
   prototype: CSSFontFeatureValuesRule;
   new (): CSSFontFeatureValuesRule;
 };
@@ -4406,7 +4430,7 @@ interface CSSFontPaletteValuesRule extends CSSRule {
   readonly overrideColors: string;
 }
 
-declare var CSSFontPaletteValuesRule: {
+declare const CSSFontPaletteValuesRule: {
   prototype: CSSFontPaletteValuesRule;
   new (): CSSFontPaletteValuesRule;
 };
@@ -4434,7 +4458,7 @@ interface CSSGroupingRule extends CSSRule {
   insertRule(rule: string, index?: number): number;
 }
 
-declare var CSSGroupingRule: {
+declare const CSSGroupingRule: {
   prototype: CSSGroupingRule;
   new (): CSSGroupingRule;
 };
@@ -4442,7 +4466,7 @@ declare var CSSGroupingRule: {
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSImageValue) */
 interface CSSImageValue extends CSSStyleValue {}
 
-declare var CSSImageValue: {
+declare const CSSImageValue: {
   prototype: CSSImageValue;
   new (): CSSImageValue;
 };
@@ -4476,7 +4500,7 @@ interface CSSImportRule extends CSSRule {
   readonly supportsText: string | null;
 }
 
-declare var CSSImportRule: {
+declare const CSSImportRule: {
   prototype: CSSImportRule;
   new (): CSSImportRule;
 };
@@ -4501,7 +4525,7 @@ interface CSSKeyframeRule extends CSSRule {
   readonly style: CSSStyleDeclaration;
 }
 
-declare var CSSKeyframeRule: {
+declare const CSSKeyframeRule: {
   prototype: CSSKeyframeRule;
   new (): CSSKeyframeRule;
 };
@@ -4543,7 +4567,7 @@ interface CSSKeyframesRule extends CSSRule {
   [index: number]: CSSKeyframeRule;
 }
 
-declare var CSSKeyframesRule: {
+declare const CSSKeyframesRule: {
   prototype: CSSKeyframesRule;
   new (): CSSKeyframesRule;
 };
@@ -4557,7 +4581,7 @@ interface CSSKeywordValue extends CSSStyleValue {
   value: string;
 }
 
-declare var CSSKeywordValue: {
+declare const CSSKeywordValue: {
   prototype: CSSKeywordValue;
   new (value: string): CSSKeywordValue;
 };
@@ -4571,7 +4595,7 @@ interface CSSLayerBlockRule extends CSSGroupingRule {
   readonly name: string;
 }
 
-declare var CSSLayerBlockRule: {
+declare const CSSLayerBlockRule: {
   prototype: CSSLayerBlockRule;
   new (): CSSLayerBlockRule;
 };
@@ -4588,7 +4612,7 @@ interface CSSLayerStatementRule extends CSSRule {
   readonly nameList: ReadonlyArray<string>;
 }
 
-declare var CSSLayerStatementRule: {
+declare const CSSLayerStatementRule: {
   prototype: CSSLayerStatementRule;
   new (): CSSLayerStatementRule;
 };
@@ -4599,7 +4623,7 @@ interface CSSMathClamp extends CSSMathValue {
   readonly value: CSSNumericValue;
 }
 
-declare var CSSMathClamp: {
+declare const CSSMathClamp: {
   prototype: CSSMathClamp;
   new (
     lower: CSSNumberish,
@@ -4617,7 +4641,7 @@ interface CSSMathInvert extends CSSMathValue {
   readonly value: CSSNumericValue;
 }
 
-declare var CSSMathInvert: {
+declare const CSSMathInvert: {
   prototype: CSSMathInvert;
   new (arg: CSSNumberish): CSSMathInvert;
 };
@@ -4631,9 +4655,9 @@ interface CSSMathMax extends CSSMathValue {
   readonly values: CSSNumericArray;
 }
 
-declare var CSSMathMax: {
+declare const CSSMathMax: {
   prototype: CSSMathMax;
-  new (...args: CSSNumberish[]): CSSMathMax;
+  new (...args: readonly CSSNumberish[]): CSSMathMax;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathMin) */
@@ -4645,9 +4669,9 @@ interface CSSMathMin extends CSSMathValue {
   readonly values: CSSNumericArray;
 }
 
-declare var CSSMathMin: {
+declare const CSSMathMin: {
   prototype: CSSMathMin;
-  new (...args: CSSNumberish[]): CSSMathMin;
+  new (...args: readonly CSSNumberish[]): CSSMathMin;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathNegate) */
@@ -4659,7 +4683,7 @@ interface CSSMathNegate extends CSSMathValue {
   readonly value: CSSNumericValue;
 }
 
-declare var CSSMathNegate: {
+declare const CSSMathNegate: {
   prototype: CSSMathNegate;
   new (arg: CSSNumberish): CSSMathNegate;
 };
@@ -4673,9 +4697,9 @@ interface CSSMathProduct extends CSSMathValue {
   readonly values: CSSNumericArray;
 }
 
-declare var CSSMathProduct: {
+declare const CSSMathProduct: {
   prototype: CSSMathProduct;
-  new (...args: CSSNumberish[]): CSSMathProduct;
+  new (...args: readonly CSSNumberish[]): CSSMathProduct;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathSum) */
@@ -4687,9 +4711,9 @@ interface CSSMathSum extends CSSMathValue {
   readonly values: CSSNumericArray;
 }
 
-declare var CSSMathSum: {
+declare const CSSMathSum: {
   prototype: CSSMathSum;
-  new (...args: CSSNumberish[]): CSSMathSum;
+  new (...args: readonly CSSNumberish[]): CSSMathSum;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSMathValue) */
@@ -4701,7 +4725,7 @@ interface CSSMathValue extends CSSNumericValue {
   readonly operator: CSSMathOperator;
 }
 
-declare var CSSMathValue: {
+declare const CSSMathValue: {
   prototype: CSSMathValue;
   new (): CSSMathValue;
 };
@@ -4718,7 +4742,7 @@ interface CSSMatrixComponent extends CSSTransformComponent {
   matrix: DOMMatrix;
 }
 
-declare var CSSMatrixComponent: {
+declare const CSSMatrixComponent: {
   prototype: CSSMatrixComponent;
   new (
     matrix: DOMMatrixReadOnly,
@@ -4741,7 +4765,7 @@ interface CSSMediaRule extends CSSConditionRule {
   readonly media: MediaList;
 }
 
-declare var CSSMediaRule: {
+declare const CSSMediaRule: {
   prototype: CSSMediaRule;
   new (): CSSMediaRule;
 };
@@ -4765,7 +4789,7 @@ interface CSSNamespaceRule extends CSSRule {
   readonly prefix: string;
 }
 
-declare var CSSNamespaceRule: {
+declare const CSSNamespaceRule: {
   prototype: CSSNamespaceRule;
   new (): CSSNamespaceRule;
 };
@@ -4783,12 +4807,12 @@ interface CSSNumericArray {
       key: number,
       parent: CSSNumericArray,
     ) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
   [index: number]: CSSNumericValue;
 }
 
-declare var CSSNumericArray: {
+declare const CSSNumericArray: {
   prototype: CSSNumericArray;
   new (): CSSNumericArray;
 };
@@ -4799,37 +4823,37 @@ interface CSSNumericValue extends CSSStyleValue {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/add)
    */
-  add(...values: CSSNumberish[]): CSSNumericValue;
+  add(...values: readonly CSSNumberish[]): CSSNumericValue;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/div)
    */
-  div(...values: CSSNumberish[]): CSSNumericValue;
+  div(...values: readonly CSSNumberish[]): CSSNumericValue;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/equals)
    */
-  equals(...value: CSSNumberish[]): boolean;
+  equals(...value: readonly CSSNumberish[]): boolean;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/max)
    */
-  max(...values: CSSNumberish[]): CSSNumericValue;
+  max(...values: readonly CSSNumberish[]): CSSNumericValue;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/min)
    */
-  min(...values: CSSNumberish[]): CSSNumericValue;
+  min(...values: readonly CSSNumberish[]): CSSNumericValue;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/mul)
    */
-  mul(...values: CSSNumberish[]): CSSNumericValue;
+  mul(...values: readonly CSSNumberish[]): CSSNumericValue;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/sub)
    */
-  sub(...values: CSSNumberish[]): CSSNumericValue;
+  sub(...values: readonly CSSNumberish[]): CSSNumericValue;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/to)
@@ -4839,7 +4863,7 @@ interface CSSNumericValue extends CSSStyleValue {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/toSum)
    */
-  toSum(...units: string[]): CSSMathSum;
+  toSum(...units: readonly string[]): CSSMathSum;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSNumericValue/type)
@@ -4847,7 +4871,7 @@ interface CSSNumericValue extends CSSStyleValue {
   type(): CSSNumericType;
 }
 
-declare var CSSNumericValue: {
+declare const CSSNumericValue: {
   prototype: CSSNumericValue;
   new (): CSSNumericValue;
   /**
@@ -4876,7 +4900,7 @@ interface CSSPageRule extends CSSGroupingRule {
   readonly style: CSSStyleDeclaration;
 }
 
-declare var CSSPageRule: {
+declare const CSSPageRule: {
   prototype: CSSPageRule;
   new (): CSSPageRule;
 };
@@ -4890,7 +4914,7 @@ interface CSSPerspective extends CSSTransformComponent {
   length: CSSPerspectiveValue;
 }
 
-declare var CSSPerspective: {
+declare const CSSPerspective: {
   prototype: CSSPerspective;
   new (length: CSSPerspectiveValue): CSSPerspective;
 };
@@ -4919,7 +4943,7 @@ interface CSSPropertyRule extends CSSRule {
   readonly syntax: string;
 }
 
-declare var CSSPropertyRule: {
+declare const CSSPropertyRule: {
   prototype: CSSPropertyRule;
   new (): CSSPropertyRule;
 };
@@ -4936,7 +4960,7 @@ interface CSSRotate extends CSSTransformComponent {
   z: CSSNumberish;
 }
 
-declare var CSSRotate: {
+declare const CSSRotate: {
   prototype: CSSRotate;
   new (angle: CSSNumericValue): CSSRotate;
   new (
@@ -4986,7 +5010,7 @@ interface CSSRule {
   readonly FONT_FEATURE_VALUES_RULE: 14;
 }
 
-declare var CSSRule: {
+declare const CSSRule: {
   prototype: CSSRule;
   new (): CSSRule;
   readonly STYLE_RULE: 1;
@@ -5023,7 +5047,7 @@ interface CSSRuleList {
   [index: number]: CSSRule;
 }
 
-declare var CSSRuleList: {
+declare const CSSRuleList: {
   prototype: CSSRuleList;
   new (): CSSRuleList;
 };
@@ -5038,7 +5062,7 @@ interface CSSScale extends CSSTransformComponent {
   z: CSSNumberish;
 }
 
-declare var CSSScale: {
+declare const CSSScale: {
   prototype: CSSScale;
   new (x: CSSNumberish, y: CSSNumberish, z?: CSSNumberish): CSSScale;
 };
@@ -5051,7 +5075,7 @@ interface CSSSkew extends CSSTransformComponent {
   ay: CSSNumericValue;
 }
 
-declare var CSSSkew: {
+declare const CSSSkew: {
   prototype: CSSSkew;
   new (ax: CSSNumericValue, ay: CSSNumericValue): CSSSkew;
 };
@@ -5062,7 +5086,7 @@ interface CSSSkewX extends CSSTransformComponent {
   ax: CSSNumericValue;
 }
 
-declare var CSSSkewX: {
+declare const CSSSkewX: {
   prototype: CSSSkewX;
   new (ax: CSSNumericValue): CSSSkewX;
 };
@@ -5073,7 +5097,7 @@ interface CSSSkewY extends CSSTransformComponent {
   ay: CSSNumericValue;
 }
 
-declare var CSSSkewY: {
+declare const CSSSkewY: {
   prototype: CSSSkewY;
   new (ay: CSSNumericValue): CSSSkewY;
 };
@@ -6861,7 +6885,7 @@ interface CSSStyleDeclaration {
   [index: number]: string;
 }
 
-declare var CSSStyleDeclaration: {
+declare const CSSStyleDeclaration: {
   prototype: CSSStyleDeclaration;
   new (): CSSStyleDeclaration;
 };
@@ -6890,7 +6914,7 @@ interface CSSStyleRule extends CSSGroupingRule {
   readonly styleMap: StylePropertyMap;
 }
 
-declare var CSSStyleRule: {
+declare const CSSStyleRule: {
   prototype: CSSStyleRule;
   new (): CSSStyleRule;
 };
@@ -6955,7 +6979,7 @@ interface CSSStyleSheet extends StyleSheet {
   replaceSync(text: string): void;
 }
 
-declare var CSSStyleSheet: {
+declare const CSSStyleSheet: {
   prototype: CSSStyleSheet;
   new (options?: CSSStyleSheetInit): CSSStyleSheet;
 };
@@ -6965,7 +6989,7 @@ interface CSSStyleValue {
   toString(): string;
 }
 
-declare var CSSStyleValue: {
+declare const CSSStyleValue: {
   prototype: CSSStyleValue;
   new (): CSSStyleValue;
   /**
@@ -6977,7 +7001,7 @@ declare var CSSStyleValue: {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleValue/parseAll_static)
    */
-  parseAll(property: string, cssText: string): CSSStyleValue[];
+  parseAll(property: string, cssText: string): readonly CSSStyleValue[];
 };
 
 /**
@@ -6989,7 +7013,7 @@ declare var CSSStyleValue: {
  */
 interface CSSSupportsRule extends CSSConditionRule {}
 
-declare var CSSSupportsRule: {
+declare const CSSSupportsRule: {
   prototype: CSSSupportsRule;
   new (): CSSSupportsRule;
 };
@@ -7012,7 +7036,7 @@ interface CSSTransformComponent {
   toString(): string;
 }
 
-declare var CSSTransformComponent: {
+declare const CSSTransformComponent: {
   prototype: CSSTransformComponent;
   new (): CSSTransformComponent;
 };
@@ -7040,14 +7064,14 @@ interface CSSTransformValue extends CSSStyleValue {
       key: number,
       parent: CSSTransformValue,
     ) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
   [index: number]: CSSTransformComponent;
 }
 
-declare var CSSTransformValue: {
+declare const CSSTransformValue: {
   prototype: CSSTransformValue;
-  new (transforms: CSSTransformComponent[]): CSSTransformValue;
+  new (transforms: readonly CSSTransformComponent[]): CSSTransformValue;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSTransition) */
@@ -7059,7 +7083,7 @@ interface CSSTransition extends Animation {
   readonly transitionProperty: string;
   addEventListener<K extends keyof AnimationEventMap>(
     type: K,
-    listener: (this: CSSTransition, ev: AnimationEventMap[K]) => any,
+    listener: (this: CSSTransition, ev: AnimationEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -7069,7 +7093,7 @@ interface CSSTransition extends Animation {
   ): void;
   removeEventListener<K extends keyof AnimationEventMap>(
     type: K,
-    listener: (this: CSSTransition, ev: AnimationEventMap[K]) => any,
+    listener: (this: CSSTransition, ev: AnimationEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -7079,7 +7103,7 @@ interface CSSTransition extends Animation {
   ): void;
 }
 
-declare var CSSTransition: {
+declare const CSSTransition: {
   prototype: CSSTransition;
   new (): CSSTransition;
 };
@@ -7094,7 +7118,7 @@ interface CSSTranslate extends CSSTransformComponent {
   z: CSSNumericValue;
 }
 
-declare var CSSTranslate: {
+declare const CSSTranslate: {
   prototype: CSSTranslate;
   new (
     x: CSSNumericValue,
@@ -7117,7 +7141,7 @@ interface CSSUnitValue extends CSSNumericValue {
   value: number;
 }
 
-declare var CSSUnitValue: {
+declare const CSSUnitValue: {
   prototype: CSSUnitValue;
   new (value: number, unit: string): CSSUnitValue;
 };
@@ -7135,14 +7159,14 @@ interface CSSUnparsedValue extends CSSStyleValue {
       key: number,
       parent: CSSUnparsedValue,
     ) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
   [index: number]: CSSUnparsedSegment;
 }
 
-declare var CSSUnparsedValue: {
+declare const CSSUnparsedValue: {
   prototype: CSSUnparsedValue;
-  new (members: CSSUnparsedSegment[]): CSSUnparsedValue;
+  new (members: readonly CSSUnparsedSegment[]): CSSUnparsedValue;
 };
 
 /**
@@ -7162,7 +7186,7 @@ interface CSSVariableReferenceValue {
   variable: string;
 }
 
-declare var CSSVariableReferenceValue: {
+declare const CSSVariableReferenceValue: {
   prototype: CSSVariableReferenceValue;
   new (
     variable: string,
@@ -7183,7 +7207,7 @@ interface Cache {
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/add) */
   add(request: RequestInfo | URL): Promise<void>;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/addAll) */
-  addAll(requests: RequestInfo[]): Promise<void>;
+  addAll(requests: readonly RequestInfo[]): Promise<void>;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/delete) */
   delete(
     request: RequestInfo | URL,
@@ -7208,7 +7232,7 @@ interface Cache {
   put(request: RequestInfo | URL, response: Response): Promise<void>;
 }
 
-declare var Cache: {
+declare const Cache: {
   prototype: Cache;
   new (): Cache;
 };
@@ -7233,7 +7257,7 @@ interface CacheStorage {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage/keys)
    */
-  keys(): Promise<string[]>;
+  keys(): Promise<readonly string[]>;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage/match)
@@ -7249,7 +7273,7 @@ interface CacheStorage {
   open(cacheName: string): Promise<Cache>;
 }
 
-declare var CacheStorage: {
+declare const CacheStorage: {
   prototype: CacheStorage;
   new (): CacheStorage;
 };
@@ -7274,7 +7298,7 @@ interface CanvasCaptureMediaStreamTrack extends MediaStreamTrack {
     listener: (
       this: CanvasCaptureMediaStreamTrack,
       ev: MediaStreamTrackEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -7287,7 +7311,7 @@ interface CanvasCaptureMediaStreamTrack extends MediaStreamTrack {
     listener: (
       this: CanvasCaptureMediaStreamTrack,
       ev: MediaStreamTrackEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -7297,7 +7321,7 @@ interface CanvasCaptureMediaStreamTrack extends MediaStreamTrack {
   ): void;
 }
 
-declare var CanvasCaptureMediaStreamTrack: {
+declare const CanvasCaptureMediaStreamTrack: {
   prototype: CanvasCaptureMediaStreamTrack;
   new (): CanvasCaptureMediaStreamTrack;
 };
@@ -7462,7 +7486,7 @@ interface CanvasGradient {
   addColorStop(offset: number, color: string): void;
 }
 
-declare var CanvasGradient: {
+declare const CanvasGradient: {
   prototype: CanvasGradient;
   new (): CanvasGradient;
 };
@@ -7630,12 +7654,12 @@ interface CanvasPathDrawingStyles {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getLineDash)
    */
-  getLineDash(): number[];
+  getLineDash(): readonly number[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash)
    */
-  setLineDash(segments: number[]): void;
+  setLineDash(segments: readonly number[]): void;
 }
 
 /**
@@ -7655,7 +7679,7 @@ interface CanvasPattern {
   setTransform(transform?: DOMMatrix2DInit): void;
 }
 
-declare var CanvasPattern: {
+declare const CanvasPattern: {
   prototype: CanvasPattern;
   new (): CanvasPattern;
 };
@@ -7715,7 +7739,7 @@ interface CanvasRenderingContext2D
   getContextAttributes(): CanvasRenderingContext2DSettings;
 }
 
-declare var CanvasRenderingContext2D: {
+declare const CanvasRenderingContext2D: {
   prototype: CanvasRenderingContext2D;
   new (): CanvasRenderingContext2D;
 };
@@ -7905,7 +7929,7 @@ interface CanvasUserInterface {
  */
 interface ChannelMergerNode extends AudioNode {}
 
-declare var ChannelMergerNode: {
+declare const ChannelMergerNode: {
   prototype: ChannelMergerNode;
   new (
     context: BaseAudioContext,
@@ -7925,7 +7949,7 @@ declare var ChannelMergerNode: {
  */
 interface ChannelSplitterNode extends AudioNode {}
 
-declare var ChannelSplitterNode: {
+declare const ChannelSplitterNode: {
   prototype: ChannelSplitterNode;
   new (
     context: BaseAudioContext,
@@ -7980,7 +8004,7 @@ interface CharacterData extends Node, ChildNode, NonDocumentTypeChildNode {
   substringData(offset: number, count: number): string;
 }
 
-declare var CharacterData: {
+declare const CharacterData: {
   prototype: CharacterData;
   new (): CharacterData;
 };
@@ -8053,7 +8077,7 @@ interface Clipboard extends EventTarget {
   writeText(data: string): Promise<void>;
 }
 
-declare var Clipboard: {
+declare const Clipboard: {
   prototype: Clipboard;
   new (): Clipboard;
 };
@@ -8072,7 +8096,7 @@ interface ClipboardEvent extends Event {
   readonly clipboardData: DataTransfer | null;
 }
 
-declare var ClipboardEvent: {
+declare const ClipboardEvent: {
   prototype: ClipboardEvent;
   new (type: string, eventInitDict?: ClipboardEventInit): ClipboardEvent;
 };
@@ -8095,7 +8119,7 @@ interface ClipboardItem {
   getType(type: string): Promise<Blob>;
 }
 
-declare var ClipboardItem: {
+declare const ClipboardItem: {
   prototype: ClipboardItem;
   new (
     items: Record<string, string | Blob | PromiseLike<string | Blob>>,
@@ -8133,7 +8157,7 @@ interface CloseEvent extends Event {
   readonly wasClean: boolean;
 }
 
-declare var CloseEvent: {
+declare const CloseEvent: {
   prototype: CloseEvent;
   new (type: string, eventInitDict?: CloseEventInit): CloseEvent;
 };
@@ -8146,7 +8170,7 @@ declare var CloseEvent: {
  */
 interface Comment extends CharacterData {}
 
-declare var Comment: {
+declare const Comment: {
   prototype: Comment;
   new (data?: string): Comment;
 };
@@ -8178,7 +8202,7 @@ interface CompositionEvent extends UIEvent {
   ): void;
 }
 
-declare var CompositionEvent: {
+declare const CompositionEvent: {
   prototype: CompositionEvent;
   new (type: string, eventInitDict?: CompositionEventInit): CompositionEvent;
 };
@@ -8186,7 +8210,7 @@ declare var CompositionEvent: {
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CompressionStream) */
 interface CompressionStream extends GenericTransformStream {}
 
-declare var CompressionStream: {
+declare const CompressionStream: {
   prototype: CompressionStream;
   new (format: CompressionFormat): CompressionStream;
 };
@@ -8206,7 +8230,7 @@ interface ConstantSourceNode extends AudioScheduledSourceNode {
     listener: (
       this: ConstantSourceNode,
       ev: AudioScheduledSourceNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -8219,7 +8243,7 @@ interface ConstantSourceNode extends AudioScheduledSourceNode {
     listener: (
       this: ConstantSourceNode,
       ev: AudioScheduledSourceNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -8229,7 +8253,7 @@ interface ConstantSourceNode extends AudioScheduledSourceNode {
   ): void;
 }
 
-declare var ConstantSourceNode: {
+declare const ConstantSourceNode: {
   prototype: ConstantSourceNode;
   new (
     context: BaseAudioContext,
@@ -8257,7 +8281,7 @@ interface ConvolverNode extends AudioNode {
   normalize: boolean;
 }
 
-declare var ConvolverNode: {
+declare const ConvolverNode: {
   prototype: ConvolverNode;
   new (context: BaseAudioContext, options?: ConvolverOptions): ConvolverNode;
 };
@@ -8282,7 +8306,7 @@ interface CountQueuingStrategy extends QueuingStrategy {
   readonly size: QueuingStrategySize;
 }
 
-declare var CountQueuingStrategy: {
+declare const CountQueuingStrategy: {
   prototype: CountQueuingStrategy;
   new (init: QueuingStrategyInit): CountQueuingStrategy;
 };
@@ -8299,7 +8323,7 @@ interface Credential {
   readonly type: string;
 }
 
-declare var Credential: {
+declare const Credential: {
   prototype: Credential;
   new (): Credential;
 };
@@ -8333,7 +8357,7 @@ interface CredentialsContainer {
   store(credential: Credential): Promise<void>;
 }
 
-declare var CredentialsContainer: {
+declare const CredentialsContainer: {
   prototype: CredentialsContainer;
   new (): CredentialsContainer;
 };
@@ -8366,7 +8390,7 @@ interface Crypto {
   randomUUID(): `${string}-${string}-${string}-${string}-${string}`;
 }
 
-declare var Crypto: {
+declare const Crypto: {
   prototype: Crypto;
   new (): Crypto;
 };
@@ -8394,10 +8418,10 @@ interface CryptoKey {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/usages)
    */
-  readonly usages: KeyUsage[];
+  readonly usages: readonly KeyUsage[];
 }
 
-declare var CryptoKey: {
+declare const CryptoKey: {
   prototype: CryptoKey;
   new (): CryptoKey;
 };
@@ -8438,13 +8462,13 @@ interface CustomElementRegistry {
   whenDefined(name: string): Promise<CustomElementConstructor>;
 }
 
-declare var CustomElementRegistry: {
+declare const CustomElementRegistry: {
   prototype: CustomElementRegistry;
   new (): CustomElementRegistry;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent) */
-interface CustomEvent<T = any> extends Event {
+interface CustomEvent<T = unknown> extends Event {
   /**
    * Returns any custom data event was created with. Typically used for
    * synthetic events.
@@ -8467,7 +8491,7 @@ interface CustomEvent<T = any> extends Event {
   ): void;
 }
 
-declare var CustomEvent: {
+declare const CustomEvent: {
   prototype: CustomEvent;
   new <T>(type: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>;
 };
@@ -8523,7 +8547,7 @@ interface DOMException extends Error {
   readonly DATA_CLONE_ERR: 25;
 }
 
-declare var DOMException: {
+declare const DOMException: {
   prototype: DOMException;
   new (message?: string, name?: string): DOMException;
   readonly INDEX_SIZE_ERR: 1;
@@ -8590,10 +8614,10 @@ interface DOMImplementation {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/DOMImplementation/hasFeature)
    */
-  hasFeature(...args: any[]): true;
+  hasFeature(...args: readonly unknown[]): true;
 }
 
-declare var DOMImplementation: {
+declare const DOMImplementation: {
   prototype: DOMImplementation;
   new (): DOMImplementation;
 };
@@ -8661,19 +8685,19 @@ interface DOMMatrix extends DOMMatrixReadOnly {
   translateSelf(tx?: number, ty?: number, tz?: number): DOMMatrix;
 }
 
-declare var DOMMatrix: {
+declare const DOMMatrix: {
   prototype: DOMMatrix;
-  new (init?: string | number[]): DOMMatrix;
+  new (init?: string | readonly number[]): DOMMatrix;
   fromFloat32Array(array32: Float32Array): DOMMatrix;
   fromFloat64Array(array64: Float64Array): DOMMatrix;
   fromMatrix(other?: DOMMatrixInit): DOMMatrix;
 };
 
 type SVGMatrix = DOMMatrix;
-declare var SVGMatrix: typeof DOMMatrix;
+declare const SVGMatrix: typeof DOMMatrix;
 
 type WebKitCSSMatrix = DOMMatrix;
-declare var WebKitCSSMatrix: typeof DOMMatrix;
+declare const WebKitCSSMatrix: typeof DOMMatrix;
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly) */
 interface DOMMatrixReadOnly {
@@ -8886,7 +8910,7 @@ interface DOMMatrixReadOnly {
    * Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/toFloat64Array)
    */
   toFloat64Array(): Float64Array;
-  toJSON(): any;
+  toJSON(): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/transformPoint)
@@ -8900,9 +8924,9 @@ interface DOMMatrixReadOnly {
   toString(): string;
 }
 
-declare var DOMMatrixReadOnly: {
+declare const DOMMatrixReadOnly: {
   prototype: DOMMatrixReadOnly;
-  new (init?: string | number[]): DOMMatrixReadOnly;
+  new (init?: string | readonly number[]): DOMMatrixReadOnly;
   fromFloat32Array(array32: Float32Array): DOMMatrixReadOnly;
   fromFloat64Array(array64: Float64Array): DOMMatrixReadOnly;
   fromMatrix(other?: DOMMatrixInit): DOMMatrixReadOnly;
@@ -8937,7 +8961,7 @@ interface DOMParser {
   parseFromString(string: string, type: DOMParserSupportedType): Document;
 }
 
-declare var DOMParser: {
+declare const DOMParser: {
   prototype: DOMParser;
   new (): DOMParser;
 };
@@ -8954,7 +8978,7 @@ interface DOMPoint extends DOMPointReadOnly {
   z: number;
 }
 
-declare var DOMPoint: {
+declare const DOMPoint: {
   prototype: DOMPoint;
   new (x?: number, y?: number, z?: number, w?: number): DOMPoint;
   /**
@@ -8965,7 +8989,7 @@ declare var DOMPoint: {
 };
 
 type SVGPoint = DOMPoint;
-declare var SVGPoint: typeof DOMPoint;
+declare const SVGPoint: typeof DOMPoint;
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly) */
 interface DOMPointReadOnly {
@@ -8998,10 +9022,10 @@ interface DOMPointReadOnly {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/DOMPointReadOnly/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var DOMPointReadOnly: {
+declare const DOMPointReadOnly: {
   prototype: DOMPointReadOnly;
   new (x?: number, y?: number, z?: number, w?: number): DOMPointReadOnly;
   /**
@@ -9026,10 +9050,10 @@ interface DOMQuad {
    * Reference](https://developer.mozilla.org/docs/Web/API/DOMQuad/getBounds)
    */
   getBounds(): DOMRect;
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var DOMQuad: {
+declare const DOMQuad: {
   prototype: DOMQuad;
   new (
     p1?: DOMPointInit,
@@ -9049,14 +9073,14 @@ interface DOMRect extends DOMRectReadOnly {
   y: number;
 }
 
-declare var DOMRect: {
+declare const DOMRect: {
   prototype: DOMRect;
   new (x?: number, y?: number, width?: number, height?: number): DOMRect;
   fromRect(other?: DOMRectInit): DOMRect;
 };
 
 type SVGRect = DOMRect;
-declare var SVGRect: typeof DOMRect;
+declare const SVGRect: typeof DOMRect;
 
 interface DOMRectList {
   readonly length: number;
@@ -9064,7 +9088,7 @@ interface DOMRectList {
   [index: number]: DOMRect;
 }
 
-declare var DOMRectList: {
+declare const DOMRectList: {
   prototype: DOMRectList;
   new (): DOMRectList;
 };
@@ -9111,10 +9135,10 @@ interface DOMRectReadOnly {
    * Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/y)
    */
   readonly y: number;
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var DOMRectReadOnly: {
+declare const DOMRectReadOnly: {
   prototype: DOMRectReadOnly;
   new (
     x?: number,
@@ -9159,7 +9183,7 @@ interface DOMStringList {
   [index: number]: string;
 }
 
-declare var DOMStringList: {
+declare const DOMStringList: {
   prototype: DOMStringList;
   new (): DOMStringList;
 };
@@ -9174,7 +9198,7 @@ interface DOMStringMap {
   [name: string]: string | undefined;
 }
 
-declare var DOMStringMap: {
+declare const DOMStringMap: {
   prototype: DOMStringMap;
   new (): DOMStringMap;
 };
@@ -9218,7 +9242,7 @@ interface DOMTokenList {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/add)
    */
-  add(...tokens: string[]): void;
+  add(...tokens: readonly string[]): void;
   /**
    * Returns true if token is present, and false otherwise.
    *
@@ -9245,7 +9269,7 @@ interface DOMTokenList {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/DOMTokenList/remove)
    */
-  remove(...tokens: string[]): void;
+  remove(...tokens: readonly string[]): void;
   /**
    * Replaces token with newToken.
    *
@@ -9290,12 +9314,12 @@ interface DOMTokenList {
   toggle(token: string, force?: boolean): boolean;
   forEach(
     callbackfn: (value: string, key: number, parent: DOMTokenList) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
   [index: number]: string;
 }
 
-declare var DOMTokenList: {
+declare const DOMTokenList: {
   prototype: DOMTokenList;
   new (): DOMTokenList;
 };
@@ -9398,7 +9422,7 @@ interface DataTransfer {
   setDragImage(image: Element, x: number, y: number): void;
 }
 
-declare var DataTransfer: {
+declare const DataTransfer: {
   prototype: DataTransfer;
   new (): DataTransfer;
 };
@@ -9447,7 +9471,7 @@ interface DataTransferItem {
   webkitGetAsEntry(): FileSystemEntry | null;
 }
 
-declare var DataTransferItem: {
+declare const DataTransferItem: {
   prototype: DataTransferItem;
   new (): DataTransferItem;
 };
@@ -9494,7 +9518,7 @@ interface DataTransferItemList {
   [index: number]: DataTransferItem;
 }
 
-declare var DataTransferItemList: {
+declare const DataTransferItemList: {
   prototype: DataTransferItemList;
   new (): DataTransferItemList;
 };
@@ -9505,7 +9529,7 @@ declare var DataTransferItemList: {
  */
 interface DecompressionStream extends GenericTransformStream {}
 
-declare var DecompressionStream: {
+declare const DecompressionStream: {
   prototype: DecompressionStream;
   new (format: CompressionFormat): DecompressionStream;
 };
@@ -9524,7 +9548,7 @@ interface DelayNode extends AudioNode {
   readonly delayTime: AudioParam;
 }
 
-declare var DelayNode: {
+declare const DelayNode: {
   prototype: DelayNode;
   new (context: BaseAudioContext, options?: DelayOptions): DelayNode;
 };
@@ -9559,7 +9583,7 @@ interface DeviceMotionEvent extends Event {
   readonly rotationRate: DeviceMotionEventRotationRate | null;
 }
 
-declare var DeviceMotionEvent: {
+declare const DeviceMotionEvent: {
   prototype: DeviceMotionEvent;
   new (type: string, eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
 };
@@ -9643,7 +9667,7 @@ interface DeviceOrientationEvent extends Event {
   readonly gamma: number | null;
 }
 
-declare var DeviceOrientationEvent: {
+declare const DeviceOrientationEvent: {
   prototype: DeviceOrientationEvent;
   new (
     type: string,
@@ -9946,22 +9970,22 @@ interface Document
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/fullscreenchange_event)
    */
-  onfullscreenchange: ((this: Document, ev: Event) => any) | null;
+  onfullscreenchange: ((this: Document, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/fullscreenerror_event)
    */
-  onfullscreenerror: ((this: Document, ev: Event) => any) | null;
+  onfullscreenerror: ((this: Document, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/pointerlockchange_event)
    */
-  onpointerlockchange: ((this: Document, ev: Event) => any) | null;
+  onpointerlockchange: ((this: Document, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/pointerlockerror_event)
    */
-  onpointerlockerror: ((this: Document, ev: Event) => any) | null;
+  onpointerlockerror: ((this: Document, ev: Event) => unknown) | null;
   /**
    * Fires when the state of the object has changed.
    *
@@ -9970,12 +9994,12 @@ interface Document
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Document/readystatechange_event)
    */
-  onreadystatechange: ((this: Document, ev: Event) => any) | null;
+  onreadystatechange: ((this: Document, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/visibilitychange_event)
    */
-  onvisibilitychange: ((this: Document, ev: Event) => any) | null;
+  onvisibilitychange: ((this: Document, ev: Event) => unknown) | null;
   readonly ownerDocument: null;
   /**
    * [MDN
@@ -10569,7 +10593,7 @@ interface Document
    *
    *   [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/write)
    */
-  write(...text: string[]): void;
+  write(...text: readonly string[]): void;
   /**
    * Writes one or more HTML expressions, followed by a carriage return, to a
    * document in the specified window.
@@ -10579,10 +10603,10 @@ interface Document
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Document/writeln)
    */
-  writeln(...text: string[]): void;
+  writeln(...text: readonly string[]): void;
   addEventListener<K extends keyof DocumentEventMap>(
     type: K,
-    listener: (this: Document, ev: DocumentEventMap[K]) => any,
+    listener: (this: Document, ev: DocumentEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -10592,7 +10616,7 @@ interface Document
   ): void;
   removeEventListener<K extends keyof DocumentEventMap>(
     type: K,
-    listener: (this: Document, ev: DocumentEventMap[K]) => any,
+    listener: (this: Document, ev: DocumentEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -10602,7 +10626,7 @@ interface Document
   ): void;
 }
 
-declare var Document: {
+declare const Document: {
   prototype: Document;
   new (): Document;
 };
@@ -10622,7 +10646,7 @@ interface DocumentFragment extends Node, NonElementParentNode, ParentNode {
   getElementById(elementId: string): HTMLElement | null;
 }
 
-declare var DocumentFragment: {
+declare const DocumentFragment: {
   prototype: DocumentFragment;
   new (): DocumentFragment;
 };
@@ -10652,7 +10676,7 @@ interface DocumentOrShadowRoot {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/adoptedStyleSheets)
    */
-  adoptedStyleSheets: CSSStyleSheet[];
+  adoptedStyleSheets: readonly CSSStyleSheet[];
   /**
    * Returns document's fullscreen element.
    *
@@ -10687,18 +10711,18 @@ interface DocumentOrShadowRoot {
    * @param y The y-offset
    */
   elementFromPoint(x: number, y: number): Element | null;
-  elementsFromPoint(x: number, y: number): Element[];
+  elementsFromPoint(x: number, y: number): readonly Element[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/getAnimations)
    */
-  getAnimations(): Animation[];
+  getAnimations(): readonly Animation[];
 }
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DocumentTimeline) */
 interface DocumentTimeline extends AnimationTimeline {}
 
-declare var DocumentTimeline: {
+declare const DocumentTimeline: {
   prototype: DocumentTimeline;
   new (options?: DocumentTimelineOptions): DocumentTimeline;
 };
@@ -10727,7 +10751,7 @@ interface DocumentType extends Node, ChildNode {
   readonly systemId: string;
 }
 
-declare var DocumentType: {
+declare const DocumentType: {
   prototype: DocumentType;
   new (): DocumentType;
 };
@@ -10751,7 +10775,7 @@ interface DragEvent extends MouseEvent {
   readonly dataTransfer: DataTransfer | null;
 }
 
-declare var DragEvent: {
+declare const DragEvent: {
   prototype: DragEvent;
   new (type: string, eventInitDict?: DragEventInit): DragEvent;
 };
@@ -10795,7 +10819,7 @@ interface DynamicsCompressorNode extends AudioNode {
   readonly threshold: AudioParam;
 }
 
-declare var DynamicsCompressorNode: {
+declare const DynamicsCompressorNode: {
   prototype: DynamicsCompressorNode;
   new (
     context: BaseAudioContext,
@@ -10987,12 +11011,12 @@ interface Element
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenchange_event)
    */
-  onfullscreenchange: ((this: Element, ev: Event) => any) | null;
+  onfullscreenchange: ((this: Element, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event)
    */
-  onfullscreenerror: ((this: Element, ev: Event) => any) | null;
+  onfullscreenerror: ((this: Element, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/outerHTML)
@@ -11104,7 +11128,7 @@ interface Element
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/getAttributeNames)
    */
-  getAttributeNames(): string[];
+  getAttributeNames(): readonly string[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/getAttributeNode)
@@ -11344,7 +11368,7 @@ interface Element
   webkitMatchesSelector(selectors: string): boolean;
   addEventListener<K extends keyof ElementEventMap>(
     type: K,
-    listener: (this: Element, ev: ElementEventMap[K]) => any,
+    listener: (this: Element, ev: ElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -11354,7 +11378,7 @@ interface Element
   ): void;
   removeEventListener<K extends keyof ElementEventMap>(
     type: K,
-    listener: (this: Element, ev: ElementEventMap[K]) => any,
+    listener: (this: Element, ev: ElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -11364,7 +11388,7 @@ interface Element
   ): void;
 }
 
-declare var Element: {
+declare const Element: {
   prototype: Element;
   new (): Element;
 };
@@ -11496,7 +11520,7 @@ interface ElementInternals extends ARIAMixin {
   ): void;
 }
 
-declare var ElementInternals: {
+declare const ElementInternals: {
   prototype: ElementInternals;
   new (): ElementInternals;
 };
@@ -11530,7 +11554,7 @@ interface EncodedVideoChunk {
   copyTo(destination: AllowSharedBufferSource): void;
 }
 
-declare var EncodedVideoChunk: {
+declare const EncodedVideoChunk: {
   prototype: EncodedVideoChunk;
   new (init: EncodedVideoChunkInit): EncodedVideoChunk;
 };
@@ -11550,7 +11574,7 @@ interface ErrorEvent extends Event {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ErrorEvent/error)
    */
-  readonly error: any;
+  readonly error: unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ErrorEvent/filename)
@@ -11568,7 +11592,7 @@ interface ErrorEvent extends Event {
   readonly message: string;
 }
 
-declare var ErrorEvent: {
+declare const ErrorEvent: {
   prototype: ErrorEvent;
   new (type: string, eventInitDict?: ErrorEventInit): ErrorEvent;
 };
@@ -11685,7 +11709,7 @@ interface Event {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Event/composedPath)
    */
-  composedPath(): EventTarget[];
+  composedPath(): readonly EventTarget[];
   /**
    * @deprecated
    *
@@ -11724,7 +11748,7 @@ interface Event {
   readonly BUBBLING_PHASE: 3;
 }
 
-declare var Event: {
+declare const Event: {
   prototype: Event;
   new (type: string, eventInitDict?: EventInit): Event;
   readonly NONE: 0;
@@ -11737,11 +11761,11 @@ declare var Event: {
 interface EventCounts {
   forEach(
     callbackfn: (value: number, key: string, parent: EventCounts) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var EventCounts: {
+declare const EventCounts: {
   prototype: EventCounts;
   new (): EventCounts;
 };
@@ -11766,17 +11790,17 @@ interface EventSource extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/EventSource/error_event)
    */
-  onerror: ((this: EventSource, ev: Event) => any) | null;
+  onerror: ((this: EventSource, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/EventSource/message_event)
    */
-  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null;
+  onmessage: ((this: EventSource, ev: MessageEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/EventSource/open_event)
    */
-  onopen: ((this: EventSource, ev: Event) => any) | null;
+  onopen: ((this: EventSource, ev: Event) => unknown) | null;
   /**
    * Returns the state of this EventSource object's connection. It can have the
    * values described below.
@@ -11812,12 +11836,12 @@ interface EventSource extends EventTarget {
   readonly CLOSED: 2;
   addEventListener<K extends keyof EventSourceEventMap>(
     type: K,
-    listener: (this: EventSource, ev: EventSourceEventMap[K]) => any,
+    listener: (this: EventSource, ev: EventSourceEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
     type: string,
-    listener: (this: EventSource, event: MessageEvent) => any,
+    listener: (this: EventSource, event: MessageEvent) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -11827,12 +11851,12 @@ interface EventSource extends EventTarget {
   ): void;
   removeEventListener<K extends keyof EventSourceEventMap>(
     type: K,
-    listener: (this: EventSource, ev: EventSourceEventMap[K]) => any,
+    listener: (this: EventSource, ev: EventSourceEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
     type: string,
-    listener: (this: EventSource, event: MessageEvent) => any,
+    listener: (this: EventSource, event: MessageEvent) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -11842,7 +11866,7 @@ interface EventSource extends EventTarget {
   ): void;
 }
 
-declare var EventSource: {
+declare const EventSource: {
   prototype: EventSource;
   new (url: string | URL, eventSourceInitDict?: EventSourceInit): EventSource;
   readonly CONNECTING: 0;
@@ -11916,7 +11940,7 @@ interface EventTarget {
   ): void;
 }
 
-declare var EventTarget: {
+declare const EventTarget: {
   prototype: EventTarget;
   new (): EventTarget;
 };
@@ -11944,7 +11968,7 @@ interface External {
 }
 
 /** @deprecated */
-declare var External: {
+declare const External: {
   prototype: External;
   new (): External;
 };
@@ -11970,9 +11994,13 @@ interface File extends Blob {
   readonly webkitRelativePath: string;
 }
 
-declare var File: {
+declare const File: {
   prototype: File;
-  new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
+  new (
+    fileBits: readonly BlobPart[],
+    fileName: string,
+    options?: FilePropertyBag,
+  ): File;
 };
 
 /**
@@ -11992,7 +12020,7 @@ interface FileList {
   [index: number]: File;
 }
 
-declare var FileList: {
+declare const FileList: {
   prototype: FileList;
   new (): FileList;
 };
@@ -12023,34 +12051,42 @@ interface FileReader extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FileReader/abort_event)
    */
-  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
+  onabort:
+    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FileReader/error_event)
    */
-  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
+  onerror:
+    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FileReader/load_event)
    */
-  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
+  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FileReader/loadend_event)
    */
-  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
+  onloadend:
+    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FileReader/loadstart_event)
    */
   onloadstart:
-    | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
+    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FileReader/progress_event)
    */
-  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null;
+  onprogress:
+    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FileReader/readyState)
@@ -12096,7 +12132,7 @@ interface FileReader extends EventTarget {
   readonly DONE: 2;
   addEventListener<K extends keyof FileReaderEventMap>(
     type: K,
-    listener: (this: FileReader, ev: FileReaderEventMap[K]) => any,
+    listener: (this: FileReader, ev: FileReaderEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -12106,7 +12142,7 @@ interface FileReader extends EventTarget {
   ): void;
   removeEventListener<K extends keyof FileReaderEventMap>(
     type: K,
-    listener: (this: FileReader, ev: FileReaderEventMap[K]) => any,
+    listener: (this: FileReader, ev: FileReaderEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -12116,7 +12152,7 @@ interface FileReader extends EventTarget {
   ): void;
 }
 
-declare var FileReader: {
+declare const FileReader: {
   prototype: FileReader;
   new (): FileReader;
   readonly EMPTY: 0;
@@ -12132,7 +12168,7 @@ interface FileSystem {
   readonly root: FileSystemDirectoryEntry;
 }
 
-declare var FileSystem: {
+declare const FileSystem: {
   prototype: FileSystem;
   new (): FileSystem;
 };
@@ -12169,7 +12205,7 @@ interface FileSystemDirectoryEntry extends FileSystemEntry {
   ): void;
 }
 
-declare var FileSystemDirectoryEntry: {
+declare const FileSystemDirectoryEntry: {
   prototype: FileSystemDirectoryEntry;
   new (): FileSystemDirectoryEntry;
 };
@@ -12207,10 +12243,12 @@ interface FileSystemDirectoryHandle extends FileSystemHandle {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FileSystemDirectoryHandle/resolve)
    */
-  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
+  resolve(
+    possibleDescendant: FileSystemHandle,
+  ): Promise<readonly string[] | null>;
 }
 
-declare var FileSystemDirectoryHandle: {
+declare const FileSystemDirectoryHandle: {
   prototype: FileSystemDirectoryHandle;
   new (): FileSystemDirectoryHandle;
 };
@@ -12230,7 +12268,7 @@ interface FileSystemDirectoryReader {
   ): void;
 }
 
-declare var FileSystemDirectoryReader: {
+declare const FileSystemDirectoryReader: {
   prototype: FileSystemDirectoryReader;
   new (): FileSystemDirectoryReader;
 };
@@ -12272,7 +12310,7 @@ interface FileSystemEntry {
   ): void;
 }
 
-declare var FileSystemEntry: {
+declare const FileSystemEntry: {
   prototype: FileSystemEntry;
   new (): FileSystemEntry;
 };
@@ -12289,7 +12327,7 @@ interface FileSystemFileEntry extends FileSystemEntry {
   file(successCallback: FileCallback, errorCallback?: ErrorCallback): void;
 }
 
-declare var FileSystemFileEntry: {
+declare const FileSystemFileEntry: {
   prototype: FileSystemFileEntry;
   new (): FileSystemFileEntry;
 };
@@ -12316,7 +12354,7 @@ interface FileSystemFileHandle extends FileSystemHandle {
   getFile(): Promise<File>;
 }
 
-declare var FileSystemFileHandle: {
+declare const FileSystemFileHandle: {
   prototype: FileSystemFileHandle;
   new (): FileSystemFileHandle;
 };
@@ -12344,7 +12382,7 @@ interface FileSystemHandle {
   isSameEntry(other: FileSystemHandle): Promise<boolean>;
 }
 
-declare var FileSystemHandle: {
+declare const FileSystemHandle: {
   prototype: FileSystemHandle;
   new (): FileSystemHandle;
 };
@@ -12373,7 +12411,7 @@ interface FileSystemWritableFileStream extends WritableStream {
   write(data: FileSystemWriteChunkType): Promise<void>;
 }
 
-declare var FileSystemWritableFileStream: {
+declare const FileSystemWritableFileStream: {
   prototype: FileSystemWritableFileStream;
   new (): FileSystemWritableFileStream;
 };
@@ -12391,7 +12429,7 @@ interface FocusEvent extends UIEvent {
   readonly relatedTarget: EventTarget | null;
 }
 
-declare var FocusEvent: {
+declare const FocusEvent: {
   prototype: FocusEvent;
   new (type: string, eventInitDict?: FocusEventInit): FocusEvent;
 };
@@ -12447,7 +12485,7 @@ interface FontFace {
   load(): Promise<FontFace>;
 }
 
-declare var FontFace: {
+declare const FontFace: {
   prototype: FontFace;
   new (
     family: string,
@@ -12468,17 +12506,17 @@ interface FontFaceSet extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FontFaceSet/loading_event)
    */
-  onloading: ((this: FontFaceSet, ev: Event) => any) | null;
+  onloading: ((this: FontFaceSet, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FontFaceSet/loadingdone_event)
    */
-  onloadingdone: ((this: FontFaceSet, ev: Event) => any) | null;
+  onloadingdone: ((this: FontFaceSet, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FontFaceSet/loadingerror_event)
    */
-  onloadingerror: ((this: FontFaceSet, ev: Event) => any) | null;
+  onloadingerror: ((this: FontFaceSet, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FontFaceSet/ready)
@@ -12498,14 +12536,14 @@ interface FontFaceSet extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/FontFaceSet/load)
    */
-  load(font: string, text?: string): Promise<FontFace[]>;
+  load(font: string, text?: string): Promise<readonly FontFace[]>;
   forEach(
     callbackfn: (value: FontFace, key: FontFace, parent: FontFaceSet) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
   addEventListener<K extends keyof FontFaceSetEventMap>(
     type: K,
-    listener: (this: FontFaceSet, ev: FontFaceSetEventMap[K]) => any,
+    listener: (this: FontFaceSet, ev: FontFaceSetEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -12515,7 +12553,7 @@ interface FontFaceSet extends EventTarget {
   ): void;
   removeEventListener<K extends keyof FontFaceSetEventMap>(
     type: K,
-    listener: (this: FontFaceSet, ev: FontFaceSetEventMap[K]) => any,
+    listener: (this: FontFaceSet, ev: FontFaceSetEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -12525,9 +12563,9 @@ interface FontFaceSet extends EventTarget {
   ): void;
 }
 
-declare var FontFaceSet: {
+declare const FontFaceSet: {
   prototype: FontFaceSet;
-  new (initialFaces: FontFace[]): FontFaceSet;
+  new (initialFaces: readonly FontFace[]): FontFaceSet;
 };
 
 /**
@@ -12542,7 +12580,7 @@ interface FontFaceSetLoadEvent extends Event {
   readonly fontfaces: ReadonlyArray<FontFace>;
 }
 
-declare var FontFaceSetLoadEvent: {
+declare const FontFaceSetLoadEvent: {
   prototype: FontFaceSetLoadEvent;
   new (
     type: string,
@@ -12573,7 +12611,7 @@ interface FormData {
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/get) */
   get(name: string): FormDataEntryValue | null;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/getAll) */
-  getAll(name: string): FormDataEntryValue[];
+  getAll(name: string): readonly FormDataEntryValue[];
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/has) */
   has(name: string): boolean;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/set) */
@@ -12586,11 +12624,11 @@ interface FormData {
       key: string,
       parent: FormData,
     ) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var FormData: {
+declare const FormData: {
   prototype: FormData;
   new (form?: HTMLFormElement, submitter?: HTMLElement | null): FormData;
 };
@@ -12608,7 +12646,7 @@ interface FormDataEvent extends Event {
   readonly formData: FormData;
 }
 
-declare var FormDataEvent: {
+declare const FormDataEvent: {
   prototype: FormDataEvent;
   new (type: string, eventInitDict: FormDataEventInit): FormDataEvent;
 };
@@ -12626,7 +12664,7 @@ interface GainNode extends AudioNode {
   readonly gain: AudioParam;
 }
 
-declare var GainNode: {
+declare const GainNode: {
   prototype: GainNode;
   new (context: BaseAudioContext, options?: GainOptions): GainNode;
 };
@@ -12662,7 +12700,7 @@ interface Gamepad {
   readonly vibrationActuator: GamepadHapticActuator | null;
 }
 
-declare var Gamepad: {
+declare const Gamepad: {
   prototype: Gamepad;
   new (): Gamepad;
 };
@@ -12692,7 +12730,7 @@ interface GamepadButton {
   readonly value: number;
 }
 
-declare var GamepadButton: {
+declare const GamepadButton: {
   prototype: GamepadButton;
   new (): GamepadButton;
 };
@@ -12713,7 +12751,7 @@ interface GamepadEvent extends Event {
   readonly gamepad: Gamepad;
 }
 
-declare var GamepadEvent: {
+declare const GamepadEvent: {
   prototype: GamepadEvent;
   new (type: string, eventInitDict: GamepadEventInit): GamepadEvent;
 };
@@ -12739,7 +12777,7 @@ interface GamepadHapticActuator {
   reset(): Promise<GamepadHapticsResult>;
 }
 
-declare var GamepadHapticActuator: {
+declare const GamepadHapticActuator: {
   prototype: GamepadHapticActuator;
   new (): GamepadHapticActuator;
 };
@@ -12790,7 +12828,7 @@ interface Geolocation {
   ): number;
 }
 
-declare var Geolocation: {
+declare const Geolocation: {
   prototype: Geolocation;
   new (): Geolocation;
 };
@@ -12839,7 +12877,7 @@ interface GeolocationCoordinates {
   readonly speed: number | null;
 }
 
-declare var GeolocationCoordinates: {
+declare const GeolocationCoordinates: {
   prototype: GeolocationCoordinates;
   new (): GeolocationCoordinates;
 };
@@ -12863,7 +12901,7 @@ interface GeolocationPosition {
   readonly timestamp: EpochTimeStamp;
 }
 
-declare var GeolocationPosition: {
+declare const GeolocationPosition: {
   prototype: GeolocationPosition;
   new (): GeolocationPosition;
 };
@@ -12888,7 +12926,7 @@ interface GeolocationPositionError {
   readonly TIMEOUT: 3;
 }
 
-declare var GeolocationPositionError: {
+declare const GeolocationPositionError: {
   prototype: GeolocationPositionError;
   new (): GeolocationPositionError;
   readonly PERMISSION_DENIED: 1;
@@ -13009,50 +13047,52 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/abort_event)
    */
-  onabort: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null;
+  onabort: ((this: GlobalEventHandlers, ev: UIEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/animationcancel_event)
    */
   onanimationcancel:
-    | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
+    | ((this: GlobalEventHandlers, ev: AnimationEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event)
    */
   onanimationend:
-    | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
+    | ((this: GlobalEventHandlers, ev: AnimationEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event)
    */
   onanimationiteration:
-    | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
+    | ((this: GlobalEventHandlers, ev: AnimationEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event)
    */
   onanimationstart:
-    | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
+    | ((this: GlobalEventHandlers, ev: AnimationEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/auxclick_event)
    */
-  onauxclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onauxclick: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/beforeinput_event)
    */
-  onbeforeinput: ((this: GlobalEventHandlers, ev: InputEvent) => any) | null;
+  onbeforeinput:
+    | ((this: GlobalEventHandlers, ev: InputEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event)
    */
-  onbeforetoggle: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onbeforetoggle: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Fires when the object loses the input focus.
    *
@@ -13061,12 +13101,12 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/blur_event)
    */
-  onblur: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null;
+  onblur: ((this: GlobalEventHandlers, ev: FocusEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/cancel_event)
    */
-  oncancel: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  oncancel: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when playback is possible, but would require further buffering.
    *
@@ -13075,12 +13115,12 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplay_event)
    */
-  oncanplay: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  oncanplay: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event)
    */
-  oncanplaythrough: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  oncanplaythrough: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Fires when the contents of the object or selection have changed.
    *
@@ -13089,7 +13129,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event)
    */
-  onchange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onchange: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Fires when the user clicks the left mouse button on the object
    *
@@ -13098,12 +13138,12 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/click_event)
    */
-  onclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onclick: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/close_event)
    */
-  onclose: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onclose: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Fires when the user clicks the right mouse button in the client area,
    * opening the context menu.
@@ -13113,22 +13153,24 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/contextmenu_event)
    */
-  oncontextmenu: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  oncontextmenu:
+    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/copy_event)
    */
-  oncopy: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null;
+  oncopy: ((this: GlobalEventHandlers, ev: ClipboardEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLTrackElement/cuechange_event)
    */
-  oncuechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  oncuechange: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/cut_event)
    */
-  oncut: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null;
+  oncut: ((this: GlobalEventHandlers, ev: ClipboardEvent) => unknown) | null;
   /**
    * Fires when the user double-clicks the object.
    *
@@ -13137,7 +13179,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/dblclick_event)
    */
-  ondblclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  ondblclick: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * Fires on the source object continuously during a drag operation.
    *
@@ -13146,7 +13188,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drag_event)
    */
-  ondrag: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
+  ondrag: ((this: GlobalEventHandlers, ev: DragEvent) => unknown) | null;
   /**
    * Fires on the source object when the user releases the mouse at the close of
    * a drag operation.
@@ -13156,7 +13198,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragend_event)
    */
-  ondragend: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
+  ondragend: ((this: GlobalEventHandlers, ev: DragEvent) => unknown) | null;
   /**
    * Fires on the target element when the user drags the object to a valid drop
    * target.
@@ -13166,7 +13208,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragenter_event)
    */
-  ondragenter: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
+  ondragenter: ((this: GlobalEventHandlers, ev: DragEvent) => unknown) | null;
   /**
    * Fires on the target object when the user moves the mouse out of a valid
    * drop target during a drag operation.
@@ -13176,7 +13218,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragleave_event)
    */
-  ondragleave: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
+  ondragleave: ((this: GlobalEventHandlers, ev: DragEvent) => unknown) | null;
   /**
    * Fires on the target element continuously while the user drags the object
    * over a valid drop target.
@@ -13186,7 +13228,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragover_event)
    */
-  ondragover: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
+  ondragover: ((this: GlobalEventHandlers, ev: DragEvent) => unknown) | null;
   /**
    * Fires on the source object when the user starts to drag a text selection or
    * selected object.
@@ -13196,12 +13238,12 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragstart_event)
    */
-  ondragstart: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
+  ondragstart: ((this: GlobalEventHandlers, ev: DragEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drop_event)
    */
-  ondrop: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
+  ondrop: ((this: GlobalEventHandlers, ev: DragEvent) => unknown) | null;
   /**
    * Occurs when the duration attribute is updated.
    *
@@ -13210,7 +13252,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/durationchange_event)
    */
-  ondurationchange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  ondurationchange: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when the media element is reset to its initial state.
    *
@@ -13219,7 +13261,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/emptied_event)
    */
-  onemptied: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onemptied: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when the end of playback is reached.
    *
@@ -13228,7 +13270,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ended_event)
    */
-  onended: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onended: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Fires when an error occurs during object loading.
    *
@@ -13246,29 +13288,31 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/focus_event)
    */
-  onfocus: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null;
+  onfocus: ((this: GlobalEventHandlers, ev: FocusEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/formdata_event)
    */
-  onformdata: ((this: GlobalEventHandlers, ev: FormDataEvent) => any) | null;
+  onformdata:
+    | ((this: GlobalEventHandlers, ev: FormDataEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/gotpointercapture_event)
    */
   ongotpointercapture:
-    | ((this: GlobalEventHandlers, ev: PointerEvent) => any)
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/input_event)
    */
-  oninput: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  oninput: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/invalid_event)
    */
-  oninvalid: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  oninvalid: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Fires when the user presses a key.
    *
@@ -13277,7 +13321,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/keydown_event)
    */
-  onkeydown: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
+  onkeydown: ((this: GlobalEventHandlers, ev: KeyboardEvent) => unknown) | null;
   /**
    * Fires when the user presses an alphanumeric key.
    *
@@ -13287,7 +13331,9 @@ interface GlobalEventHandlers {
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/keypress_event)
    * @param ev The event.
    */
-  onkeypress: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
+  onkeypress:
+    | ((this: GlobalEventHandlers, ev: KeyboardEvent) => unknown)
+    | null;
   /**
    * Fires when the user releases a key.
    *
@@ -13296,7 +13342,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/keyup_event)
    */
-  onkeyup: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
+  onkeyup: ((this: GlobalEventHandlers, ev: KeyboardEvent) => unknown) | null;
   /**
    * Fires immediately after the browser loads the object.
    *
@@ -13305,7 +13351,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/SVGElement/load_event)
    */
-  onload: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onload: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when media data is loaded at the current playback position.
    *
@@ -13314,7 +13360,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadeddata_event)
    */
-  onloadeddata: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onloadeddata: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when the duration and dimensions of the media have been determined.
    *
@@ -13323,7 +13369,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadedmetadata_event)
    */
-  onloadedmetadata: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onloadedmetadata: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when Internet Explorer begins looking for media data.
    *
@@ -13332,13 +13378,13 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadstart_event)
    */
-  onloadstart: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onloadstart: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lostpointercapture_event)
    */
   onlostpointercapture:
-    | ((this: GlobalEventHandlers, ev: PointerEvent) => any)
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
     | null;
   /**
    * Fires when the user clicks the object with either mouse button.
@@ -13348,17 +13394,17 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mousedown_event)
    */
-  onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseenter_event)
    */
-  onmouseenter: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onmouseenter: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseleave_event)
    */
-  onmouseleave: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onmouseleave: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * Fires when the user moves the mouse over the object.
    *
@@ -13367,7 +13413,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mousemove_event)
    */
-  onmousemove: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onmousemove: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * Fires when the user moves the mouse pointer outside the boundaries of the
    * object.
@@ -13377,7 +13423,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseout_event)
    */
-  onmouseout: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onmouseout: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * Fires when the user moves the mouse pointer into the object.
    *
@@ -13386,7 +13432,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseover_event)
    */
-  onmouseover: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onmouseover: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * Fires when the user releases a mouse button while the mouse is over the
    * object.
@@ -13396,12 +13442,12 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseup_event)
    */
-  onmouseup: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
+  onmouseup: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/paste_event)
    */
-  onpaste: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null;
+  onpaste: ((this: GlobalEventHandlers, ev: ClipboardEvent) => unknown) | null;
   /**
    * Occurs when playback is paused.
    *
@@ -13410,7 +13456,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/pause_event)
    */
-  onpause: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onpause: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when the play method is requested.
    *
@@ -13419,7 +13465,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play_event)
    */
-  onplay: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onplay: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when the audio or video has started playing.
    *
@@ -13428,49 +13474,63 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/playing_event)
    */
-  onplaying: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onplaying: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointercancel_event)
    */
   onpointercancel:
-    | ((this: GlobalEventHandlers, ev: PointerEvent) => any)
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)
    */
-  onpointerdown: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
+  onpointerdown:
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)
    */
-  onpointerenter: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
+  onpointerenter:
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)
    */
-  onpointerleave: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
+  onpointerleave:
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event)
    */
-  onpointermove: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
+  onpointermove:
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerout_event)
    */
-  onpointerout: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
+  onpointerout:
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerover_event)
    */
-  onpointerover: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
+  onpointerover:
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)
    */
-  onpointerup: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
+  onpointerup:
+    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
+    | null;
   /**
    * Occurs to indicate progress while downloading media data.
    *
@@ -13479,7 +13539,9 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/progress_event)
    */
-  onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
+  onprogress:
+    | ((this: GlobalEventHandlers, ev: ProgressEvent) => unknown)
+    | null;
   /**
    * Occurs when the playback rate is increased or decreased.
    *
@@ -13488,7 +13550,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ratechange_event)
    */
-  onratechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onratechange: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Fires when the user resets a form.
    *
@@ -13497,12 +13559,12 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/reset_event)
    */
-  onreset: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onreset: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/resize_event)
    */
-  onresize: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null;
+  onresize: ((this: GlobalEventHandlers, ev: UIEvent) => unknown) | null;
   /**
    * Fires when the user repositions the scroll box in the scroll bar on the
    * object.
@@ -13512,18 +13574,18 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Document/scroll_event)
    */
-  onscroll: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onscroll: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollend_event)
    */
-  onscrollend: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onscrollend: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/securitypolicyviolation_event)
    */
   onsecuritypolicyviolation:
-    | ((this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent) => any)
+    | ((this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent) => unknown)
     | null;
   /**
    * Occurs when the seek operation ends.
@@ -13533,7 +13595,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeked_event)
    */
-  onseeked: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onseeked: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when the current playback position is moved.
    *
@@ -13542,7 +13604,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeking_event)
    */
-  onseeking: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onseeking: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Fires when the current selection changes.
    *
@@ -13551,22 +13613,22 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select_event)
    */
-  onselect: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onselect: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Document/selectionchange_event)
    */
-  onselectionchange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onselectionchange: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event)
    */
-  onselectstart: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onselectstart: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/slotchange_event)
    */
-  onslotchange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onslotchange: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when the download has stopped.
    *
@@ -13575,12 +13637,12 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/stalled_event)
    */
-  onstalled: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onstalled: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/submit_event)
    */
-  onsubmit: ((this: GlobalEventHandlers, ev: SubmitEvent) => any) | null;
+  onsubmit: ((this: GlobalEventHandlers, ev: SubmitEvent) => unknown) | null;
   /**
    * Occurs if the load operation has been intentionally halted.
    *
@@ -13589,7 +13651,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/suspend_event)
    */
-  onsuspend: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onsuspend: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs to indicate the current playback position.
    *
@@ -13598,18 +13660,18 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/timeupdate_event)
    */
-  ontimeupdate: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  ontimeupdate: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLDetailsElement/toggle_event)
    */
-  ontoggle: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  ontoggle: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/touchcancel_event)
    */
   ontouchcancel?:
-    | ((this: GlobalEventHandlers, ev: TouchEvent) => any)
+    | ((this: GlobalEventHandlers, ev: TouchEvent) => unknown)
     | null
     | undefined;
   /**
@@ -13617,7 +13679,7 @@ interface GlobalEventHandlers {
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/touchend_event)
    */
   ontouchend?:
-    | ((this: GlobalEventHandlers, ev: TouchEvent) => any)
+    | ((this: GlobalEventHandlers, ev: TouchEvent) => unknown)
     | null
     | undefined;
   /**
@@ -13625,7 +13687,7 @@ interface GlobalEventHandlers {
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/touchmove_event)
    */
   ontouchmove?:
-    | ((this: GlobalEventHandlers, ev: TouchEvent) => any)
+    | ((this: GlobalEventHandlers, ev: TouchEvent) => unknown)
     | null
     | undefined;
   /**
@@ -13633,7 +13695,7 @@ interface GlobalEventHandlers {
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/touchstart_event)
    */
   ontouchstart?:
-    | ((this: GlobalEventHandlers, ev: TouchEvent) => any)
+    | ((this: GlobalEventHandlers, ev: TouchEvent) => unknown)
     | null
     | undefined;
   /**
@@ -13641,28 +13703,28 @@ interface GlobalEventHandlers {
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/transitioncancel_event)
    */
   ontransitioncancel:
-    | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
+    | ((this: GlobalEventHandlers, ev: TransitionEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event)
    */
   ontransitionend:
-    | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
+    | ((this: GlobalEventHandlers, ev: TransitionEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionrun_event)
    */
   ontransitionrun:
-    | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
+    | ((this: GlobalEventHandlers, ev: TransitionEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionstart_event)
    */
   ontransitionstart:
-    | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
+    | ((this: GlobalEventHandlers, ev: TransitionEvent) => unknown)
     | null;
   /**
    * Occurs when the volume is changed, or playback is muted or unmuted.
@@ -13672,7 +13734,7 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volumechange_event)
    */
-  onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onvolumechange: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * Occurs when playback stops because the next frame of a video resource is
    * not available.
@@ -13682,14 +13744,16 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waiting_event)
    */
-  onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onwaiting: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
   /**
    * @deprecated This is a legacy alias of `onanimationend`.
    *
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event)
    */
-  onwebkitanimationend: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onwebkitanimationend:
+    | ((this: GlobalEventHandlers, ev: Event) => unknown)
+    | null;
   /**
    * @deprecated This is a legacy alias of `onanimationiteration`.
    *
@@ -13697,7 +13761,7 @@ interface GlobalEventHandlers {
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event)
    */
   onwebkitanimationiteration:
-    | ((this: GlobalEventHandlers, ev: Event) => any)
+    | ((this: GlobalEventHandlers, ev: Event) => unknown)
     | null;
   /**
    * @deprecated This is a legacy alias of `onanimationstart`.
@@ -13706,7 +13770,7 @@ interface GlobalEventHandlers {
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event)
    */
   onwebkitanimationstart:
-    | ((this: GlobalEventHandlers, ev: Event) => any)
+    | ((this: GlobalEventHandlers, ev: Event) => unknown)
     | null;
   /**
    * @deprecated This is a legacy alias of `ontransitionend`.
@@ -13714,18 +13778,20 @@ interface GlobalEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event)
    */
-  onwebkittransitionend: ((this: GlobalEventHandlers, ev: Event) => any) | null;
+  onwebkittransitionend:
+    | ((this: GlobalEventHandlers, ev: Event) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Element/wheel_event)
    */
-  onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null;
+  onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => unknown) | null;
   addEventListener<K extends keyof GlobalEventHandlersEventMap>(
     type: K,
     listener: (
       this: GlobalEventHandlers,
       ev: GlobalEventHandlersEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -13738,7 +13804,7 @@ interface GlobalEventHandlers {
     listener: (
       this: GlobalEventHandlers,
       ev: GlobalEventHandlersEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -13782,7 +13848,7 @@ interface HTMLAllCollection {
   [index: number]: Element;
 }
 
-declare var HTMLAllCollection: {
+declare const HTMLAllCollection: {
   prototype: HTMLAllCollection;
   new (): HTMLAllCollection;
 };
@@ -13893,7 +13959,7 @@ interface HTMLAnchorElement extends HTMLElement, HTMLHyperlinkElementUtils {
   type: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -13903,7 +13969,7 @@ interface HTMLAnchorElement extends HTMLElement, HTMLHyperlinkElementUtils {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -13913,7 +13979,7 @@ interface HTMLAnchorElement extends HTMLElement, HTMLHyperlinkElementUtils {
   ): void;
 }
 
-declare var HTMLAnchorElement: {
+declare const HTMLAnchorElement: {
   prototype: HTMLAnchorElement;
   new (): HTMLAnchorElement;
 };
@@ -13986,7 +14052,7 @@ interface HTMLAreaElement extends HTMLElement, HTMLHyperlinkElementUtils {
   target: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLAreaElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLAreaElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -13996,7 +14062,7 @@ interface HTMLAreaElement extends HTMLElement, HTMLHyperlinkElementUtils {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLAreaElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLAreaElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14006,7 +14072,7 @@ interface HTMLAreaElement extends HTMLElement, HTMLHyperlinkElementUtils {
   ): void;
 }
 
-declare var HTMLAreaElement: {
+declare const HTMLAreaElement: {
   prototype: HTMLAreaElement;
   new (): HTMLAreaElement;
 };
@@ -14020,7 +14086,10 @@ declare var HTMLAreaElement: {
 interface HTMLAudioElement extends HTMLMediaElement {
   addEventListener<K extends keyof HTMLMediaElementEventMap>(
     type: K,
-    listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
+    listener: (
+      this: HTMLAudioElement,
+      ev: HTMLMediaElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14030,7 +14099,10 @@ interface HTMLAudioElement extends HTMLMediaElement {
   ): void;
   removeEventListener<K extends keyof HTMLMediaElementEventMap>(
     type: K,
-    listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
+    listener: (
+      this: HTMLAudioElement,
+      ev: HTMLMediaElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14040,7 +14112,7 @@ interface HTMLAudioElement extends HTMLMediaElement {
   ): void;
 }
 
-declare var HTMLAudioElement: {
+declare const HTMLAudioElement: {
   prototype: HTMLAudioElement;
   new (): HTMLAudioElement;
 };
@@ -14063,7 +14135,7 @@ interface HTMLBRElement extends HTMLElement {
   clear: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLBRElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLBRElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14073,7 +14145,7 @@ interface HTMLBRElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLBRElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLBRElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14083,7 +14155,7 @@ interface HTMLBRElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLBRElement: {
+declare const HTMLBRElement: {
   prototype: HTMLBRElement;
   new (): HTMLBRElement;
 };
@@ -14111,7 +14183,7 @@ interface HTMLBaseElement extends HTMLElement {
   target: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLBaseElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLBaseElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14121,7 +14193,7 @@ interface HTMLBaseElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLBaseElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLBaseElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14131,7 +14203,7 @@ interface HTMLBaseElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLBaseElement: {
+declare const HTMLBaseElement: {
   prototype: HTMLBaseElement;
   new (): HTMLBaseElement;
 };
@@ -14191,7 +14263,10 @@ interface HTMLBodyElement extends HTMLElement, WindowEventHandlers {
   vLink: string;
   addEventListener<K extends keyof HTMLBodyElementEventMap>(
     type: K,
-    listener: (this: HTMLBodyElement, ev: HTMLBodyElementEventMap[K]) => any,
+    listener: (
+      this: HTMLBodyElement,
+      ev: HTMLBodyElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14201,7 +14276,10 @@ interface HTMLBodyElement extends HTMLElement, WindowEventHandlers {
   ): void;
   removeEventListener<K extends keyof HTMLBodyElementEventMap>(
     type: K,
-    listener: (this: HTMLBodyElement, ev: HTMLBodyElementEventMap[K]) => any,
+    listener: (
+      this: HTMLBodyElement,
+      ev: HTMLBodyElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14211,7 +14289,7 @@ interface HTMLBodyElement extends HTMLElement, WindowEventHandlers {
   ): void;
 }
 
-declare var HTMLBodyElement: {
+declare const HTMLBodyElement: {
   prototype: HTMLBodyElement;
   new (): HTMLBodyElement;
 };
@@ -14346,7 +14424,7 @@ interface HTMLButtonElement extends HTMLElement, PopoverInvokerElement {
   setCustomValidity(error: string): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14356,7 +14434,7 @@ interface HTMLButtonElement extends HTMLElement, PopoverInvokerElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14366,7 +14444,7 @@ interface HTMLButtonElement extends HTMLElement, PopoverInvokerElement {
   ): void;
 }
 
-declare var HTMLButtonElement: {
+declare const HTMLButtonElement: {
   prototype: HTMLButtonElement;
   new (): HTMLButtonElement;
 };
@@ -14428,12 +14506,12 @@ interface HTMLCanvasElement extends HTMLElement {
     contextId: 'webgl2',
     options?: WebGLContextAttributes,
   ): WebGL2RenderingContext | null;
-  getContext(contextId: string, options?: any): RenderingContext | null;
+  getContext(contextId: string, options?: unknown): RenderingContext | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toBlob)
    */
-  toBlob(callback: BlobCallback, type?: string, quality?: any): void;
+  toBlob(callback: BlobCallback, type?: string, quality?: unknown): void;
   /**
    * Returns the content of the current canvas as an image that you can use as a
    * source for another canvas or an HTML element.
@@ -14444,7 +14522,7 @@ interface HTMLCanvasElement extends HTMLElement {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL)
    */
-  toDataURL(type?: string, quality?: any): string;
+  toDataURL(type?: string, quality?: unknown): string;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/transferControlToOffscreen)
@@ -14452,7 +14530,7 @@ interface HTMLCanvasElement extends HTMLElement {
   transferControlToOffscreen(): OffscreenCanvas;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14462,7 +14540,7 @@ interface HTMLCanvasElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14472,7 +14550,7 @@ interface HTMLCanvasElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLCanvasElement: {
+declare const HTMLCanvasElement: {
   prototype: HTMLCanvasElement;
   new (): HTMLCanvasElement;
 };
@@ -14512,7 +14590,7 @@ interface HTMLCollection extends HTMLCollectionBase {
   namedItem(name: string): Element | null;
 }
 
-declare var HTMLCollection: {
+declare const HTMLCollection: {
   prototype: HTMLCollection;
   new (): HTMLCollection;
 };
@@ -14540,7 +14618,7 @@ interface HTMLDListElement extends HTMLElement {
   compact: boolean;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDListElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDListElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14550,7 +14628,7 @@ interface HTMLDListElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDListElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDListElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14560,7 +14638,7 @@ interface HTMLDListElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLDListElement: {
+declare const HTMLDListElement: {
   prototype: HTMLDListElement;
   new (): HTMLDListElement;
 };
@@ -14579,7 +14657,7 @@ interface HTMLDataElement extends HTMLElement {
   value: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDataElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDataElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14589,7 +14667,7 @@ interface HTMLDataElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDataElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDataElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14599,7 +14677,7 @@ interface HTMLDataElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLDataElement: {
+declare const HTMLDataElement: {
   prototype: HTMLDataElement;
   new (): HTMLDataElement;
 };
@@ -14622,7 +14700,10 @@ interface HTMLDataListElement extends HTMLElement {
   readonly options: HTMLCollectionOf<HTMLOptionElement>;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDataListElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLDataListElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14632,7 +14713,10 @@ interface HTMLDataListElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDataListElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLDataListElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14642,7 +14726,7 @@ interface HTMLDataListElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLDataListElement: {
+declare const HTMLDataListElement: {
   prototype: HTMLDataListElement;
   new (): HTMLDataListElement;
 };
@@ -14660,7 +14744,7 @@ interface HTMLDetailsElement extends HTMLElement {
   open: boolean;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDetailsElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDetailsElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14670,7 +14754,7 @@ interface HTMLDetailsElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDetailsElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDetailsElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14680,7 +14764,7 @@ interface HTMLDetailsElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLDetailsElement: {
+declare const HTMLDetailsElement: {
   prototype: HTMLDetailsElement;
   new (): HTMLDetailsElement;
 };
@@ -14720,7 +14804,7 @@ interface HTMLDialogElement extends HTMLElement {
   showModal(): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14730,7 +14814,7 @@ interface HTMLDialogElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14740,7 +14824,7 @@ interface HTMLDialogElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLDialogElement: {
+declare const HTMLDialogElement: {
   prototype: HTMLDialogElement;
   new (): HTMLDialogElement;
 };
@@ -14751,7 +14835,10 @@ interface HTMLDirectoryElement extends HTMLElement {
   compact: boolean;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDirectoryElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLDirectoryElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14761,7 +14848,10 @@ interface HTMLDirectoryElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDirectoryElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLDirectoryElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14772,7 +14862,7 @@ interface HTMLDirectoryElement extends HTMLElement {
 }
 
 /** @deprecated */
-declare var HTMLDirectoryElement: {
+declare const HTMLDirectoryElement: {
   prototype: HTMLDirectoryElement;
   new (): HTMLDirectoryElement;
 };
@@ -14795,7 +14885,7 @@ interface HTMLDivElement extends HTMLElement {
   align: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14805,7 +14895,7 @@ interface HTMLDivElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14815,7 +14905,7 @@ interface HTMLDivElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLDivElement: {
+declare const HTMLDivElement: {
   prototype: HTMLDivElement;
   new (): HTMLDivElement;
 };
@@ -14824,7 +14914,7 @@ declare var HTMLDivElement: {
 interface HTMLDocument extends Document {
   addEventListener<K extends keyof DocumentEventMap>(
     type: K,
-    listener: (this: HTMLDocument, ev: DocumentEventMap[K]) => any,
+    listener: (this: HTMLDocument, ev: DocumentEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14834,7 +14924,7 @@ interface HTMLDocument extends Document {
   ): void;
   removeEventListener<K extends keyof DocumentEventMap>(
     type: K,
-    listener: (this: HTMLDocument, ev: DocumentEventMap[K]) => any,
+    listener: (this: HTMLDocument, ev: DocumentEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -14845,7 +14935,7 @@ interface HTMLDocument extends Document {
 }
 
 /** @deprecated */
-declare var HTMLDocument: {
+declare const HTMLDocument: {
   prototype: HTMLDocument;
   new (): HTMLDocument;
 };
@@ -14981,7 +15071,7 @@ interface HTMLElement
   togglePopover(force?: boolean): boolean;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -14991,7 +15081,7 @@ interface HTMLElement
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15001,7 +15091,7 @@ interface HTMLElement
   ): void;
 }
 
-declare var HTMLElement: {
+declare const HTMLElement: {
   prototype: HTMLElement;
   new (): HTMLElement;
 };
@@ -15031,7 +15121,7 @@ interface HTMLEmbedElement extends HTMLElement {
   getSVGDocument(): Document | null;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLEmbedElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLEmbedElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15041,7 +15131,7 @@ interface HTMLEmbedElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLEmbedElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLEmbedElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15051,7 +15141,7 @@ interface HTMLEmbedElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLEmbedElement: {
+declare const HTMLEmbedElement: {
   prototype: HTMLEmbedElement;
   new (): HTMLEmbedElement;
 };
@@ -15141,7 +15231,10 @@ interface HTMLFieldSetElement extends HTMLElement {
   setCustomValidity(error: string): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLFieldSetElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLFieldSetElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15151,7 +15244,10 @@ interface HTMLFieldSetElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLFieldSetElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLFieldSetElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15161,7 +15257,7 @@ interface HTMLFieldSetElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLFieldSetElement: {
+declare const HTMLFieldSetElement: {
   prototype: HTMLFieldSetElement;
   new (): HTMLFieldSetElement;
 };
@@ -15201,7 +15297,7 @@ interface HTMLFontElement extends HTMLElement {
   size: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLFontElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLFontElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15211,7 +15307,7 @@ interface HTMLFontElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLFontElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLFontElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15222,7 +15318,7 @@ interface HTMLFontElement extends HTMLElement {
 }
 
 /** @deprecated */
-declare var HTMLFontElement: {
+declare const HTMLFontElement: {
   prototype: HTMLFontElement;
   new (): HTMLFontElement;
 };
@@ -15246,7 +15342,7 @@ interface HTMLFormControlsCollection extends HTMLCollectionBase {
   namedItem(name: string): RadioNodeList | Element | null;
 }
 
-declare var HTMLFormControlsCollection: {
+declare const HTMLFormControlsCollection: {
   prototype: HTMLFormControlsCollection;
   new (): HTMLFormControlsCollection;
 };
@@ -15373,7 +15469,7 @@ interface HTMLFormElement extends HTMLElement {
   submit(): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLFormElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLFormElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15383,7 +15479,7 @@ interface HTMLFormElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLFormElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLFormElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15392,10 +15488,10 @@ interface HTMLFormElement extends HTMLElement {
     options?: boolean | EventListenerOptions,
   ): void;
   [index: number]: Element;
-  [name: string]: any;
+  [name: string]: unknown;
 }
 
-declare var HTMLFormElement: {
+declare const HTMLFormElement: {
   prototype: HTMLFormElement;
   new (): HTMLFormElement;
 };
@@ -15500,7 +15596,7 @@ interface HTMLFrameElement extends HTMLElement {
   src: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLFrameElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLFrameElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15510,7 +15606,7 @@ interface HTMLFrameElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLFrameElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLFrameElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15521,7 +15617,7 @@ interface HTMLFrameElement extends HTMLElement {
 }
 
 /** @deprecated */
-declare var HTMLFrameElement: {
+declare const HTMLFrameElement: {
   prototype: HTMLFrameElement;
   new (): HTMLFrameElement;
 };
@@ -15557,7 +15653,7 @@ interface HTMLFrameSetElement extends HTMLElement, WindowEventHandlers {
     listener: (
       this: HTMLFrameSetElement,
       ev: HTMLFrameSetElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15570,7 +15666,7 @@ interface HTMLFrameSetElement extends HTMLElement, WindowEventHandlers {
     listener: (
       this: HTMLFrameSetElement,
       ev: HTMLFrameSetElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15581,7 +15677,7 @@ interface HTMLFrameSetElement extends HTMLElement, WindowEventHandlers {
 }
 
 /** @deprecated */
-declare var HTMLFrameSetElement: {
+declare const HTMLFrameSetElement: {
   prototype: HTMLFrameSetElement;
   new (): HTMLFrameSetElement;
 };
@@ -15617,7 +15713,7 @@ interface HTMLHRElement extends HTMLElement {
   width: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLHRElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLHRElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15627,7 +15723,7 @@ interface HTMLHRElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLHRElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLHRElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15637,7 +15733,7 @@ interface HTMLHRElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLHRElement: {
+declare const HTMLHRElement: {
   prototype: HTMLHRElement;
   new (): HTMLHRElement;
 };
@@ -15652,7 +15748,7 @@ declare var HTMLHRElement: {
 interface HTMLHeadElement extends HTMLElement {
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLHeadElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLHeadElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15662,7 +15758,7 @@ interface HTMLHeadElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLHeadElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLHeadElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15672,7 +15768,7 @@ interface HTMLHeadElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLHeadElement: {
+declare const HTMLHeadElement: {
   prototype: HTMLHeadElement;
   new (): HTMLHeadElement;
 };
@@ -15696,7 +15792,7 @@ interface HTMLHeadingElement extends HTMLElement {
   align: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLHeadingElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLHeadingElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15706,7 +15802,7 @@ interface HTMLHeadingElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLHeadingElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLHeadingElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15716,7 +15812,7 @@ interface HTMLHeadingElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLHeadingElement: {
+declare const HTMLHeadingElement: {
   prototype: HTMLHeadingElement;
   new (): HTMLHeadingElement;
 };
@@ -15739,7 +15835,7 @@ interface HTMLHtmlElement extends HTMLElement {
   version: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLHtmlElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLHtmlElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -15749,7 +15845,7 @@ interface HTMLHtmlElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLHtmlElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLHtmlElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -15759,7 +15855,7 @@ interface HTMLHtmlElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLHtmlElement: {
+declare const HTMLHtmlElement: {
   prototype: HTMLHtmlElement;
   new (): HTMLHtmlElement;
 };
@@ -15991,7 +16087,7 @@ interface HTMLIFrameElement extends HTMLElement {
   getSVGDocument(): Document | null;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLIFrameElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLIFrameElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16001,7 +16097,7 @@ interface HTMLIFrameElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLIFrameElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLIFrameElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16011,7 +16107,7 @@ interface HTMLIFrameElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLIFrameElement: {
+declare const HTMLIFrameElement: {
   prototype: HTMLIFrameElement;
   new (): HTMLIFrameElement;
 };
@@ -16208,7 +16304,7 @@ interface HTMLImageElement extends HTMLElement {
   decode(): Promise<void>;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLImageElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLImageElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16218,7 +16314,7 @@ interface HTMLImageElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLImageElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLImageElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16228,7 +16324,7 @@ interface HTMLImageElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLImageElement: {
+declare const HTMLImageElement: {
   prototype: HTMLImageElement;
   new (): HTMLImageElement;
 };
@@ -16564,7 +16660,7 @@ interface HTMLInputElement extends HTMLElement, PopoverInvokerElement {
   stepUp(n?: number): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16574,7 +16670,7 @@ interface HTMLInputElement extends HTMLElement, PopoverInvokerElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16584,7 +16680,7 @@ interface HTMLInputElement extends HTMLElement, PopoverInvokerElement {
   ): void;
 }
 
-declare var HTMLInputElement: {
+declare const HTMLInputElement: {
   prototype: HTMLInputElement;
   new (): HTMLInputElement;
 };
@@ -16603,7 +16699,7 @@ interface HTMLLIElement extends HTMLElement {
   value: number;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLLIElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLLIElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16613,7 +16709,7 @@ interface HTMLLIElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLLIElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLLIElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16623,7 +16719,7 @@ interface HTMLLIElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLLIElement: {
+declare const HTMLLIElement: {
   prototype: HTMLLIElement;
   new (): HTMLLIElement;
 };
@@ -16658,7 +16754,7 @@ interface HTMLLabelElement extends HTMLElement {
   htmlFor: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLLabelElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLLabelElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16668,7 +16764,7 @@ interface HTMLLabelElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLLabelElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLLabelElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16678,14 +16774,13 @@ interface HTMLLabelElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLLabelElement: {
+declare const HTMLLabelElement: {
   prototype: HTMLLabelElement;
   new (): HTMLLabelElement;
 };
 
 /**
- * The HTMLLegendElement is an interface allowing to access properties of
- * the<legend> elements. It inherits properties and methods from the HTMLElement
+ * The HTMLLegendElement is an interface allowing to access properties of the<legend> elements. It inherits properties and methods from the HTMLElement
  * interface.
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLLegendElement)
@@ -16697,7 +16792,7 @@ interface HTMLLegendElement extends HTMLElement {
   readonly form: HTMLFormElement | null;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLLegendElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLLegendElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16707,7 +16802,7 @@ interface HTMLLegendElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLLegendElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLLegendElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16717,7 +16812,7 @@ interface HTMLLegendElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLLegendElement: {
+declare const HTMLLegendElement: {
   prototype: HTMLLegendElement;
   new (): HTMLLegendElement;
 };
@@ -16811,7 +16906,7 @@ interface HTMLLinkElement extends HTMLElement, LinkStyle {
   type: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLLinkElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLLinkElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16821,7 +16916,7 @@ interface HTMLLinkElement extends HTMLElement, LinkStyle {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLLinkElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLLinkElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16831,7 +16926,7 @@ interface HTMLLinkElement extends HTMLElement, LinkStyle {
   ): void;
 }
 
-declare var HTMLLinkElement: {
+declare const HTMLLinkElement: {
   prototype: HTMLLinkElement;
   new (): HTMLLinkElement;
 };
@@ -16861,7 +16956,7 @@ interface HTMLMapElement extends HTMLElement {
   name: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMapElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMapElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16871,7 +16966,7 @@ interface HTMLMapElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMapElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMapElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16881,7 +16976,7 @@ interface HTMLMapElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLMapElement: {
+declare const HTMLMapElement: {
   prototype: HTMLMapElement;
   new (): HTMLMapElement;
 };
@@ -16923,7 +17018,7 @@ interface HTMLMarqueeElement extends HTMLElement {
   stop(): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMarqueeElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMarqueeElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -16933,7 +17028,7 @@ interface HTMLMarqueeElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMarqueeElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMarqueeElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -16944,7 +17039,7 @@ interface HTMLMarqueeElement extends HTMLElement {
 }
 
 /** @deprecated */
-declare var HTMLMarqueeElement: {
+declare const HTMLMarqueeElement: {
   prototype: HTMLMarqueeElement;
   new (): HTMLMarqueeElement;
 };
@@ -17082,13 +17177,13 @@ interface HTMLMediaElement extends HTMLElement {
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/encrypted_event)
    */
   onencrypted:
-    | ((this: HTMLMediaElement, ev: MediaEncryptedEvent) => any)
+    | ((this: HTMLMediaElement, ev: MediaEncryptedEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waitingforkey_event)
    */
-  onwaitingforkey: ((this: HTMLMediaElement, ev: Event) => any) | null;
+  onwaitingforkey: ((this: HTMLMediaElement, ev: Event) => unknown) | null;
   /**
    * Gets a flag that specifies whether playback is paused.
    *
@@ -17249,7 +17344,10 @@ interface HTMLMediaElement extends HTMLElement {
   readonly HAVE_ENOUGH_DATA: 4;
   addEventListener<K extends keyof HTMLMediaElementEventMap>(
     type: K,
-    listener: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap[K]) => any,
+    listener: (
+      this: HTMLMediaElement,
+      ev: HTMLMediaElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17259,7 +17357,10 @@ interface HTMLMediaElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLMediaElementEventMap>(
     type: K,
-    listener: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap[K]) => any,
+    listener: (
+      this: HTMLMediaElement,
+      ev: HTMLMediaElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17269,7 +17370,7 @@ interface HTMLMediaElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLMediaElement: {
+declare const HTMLMediaElement: {
   prototype: HTMLMediaElement;
   new (): HTMLMediaElement;
   readonly NETWORK_EMPTY: 0;
@@ -17294,7 +17395,7 @@ interface HTMLMenuElement extends HTMLElement {
   compact: boolean;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMenuElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMenuElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17304,7 +17405,7 @@ interface HTMLMenuElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMenuElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMenuElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17314,7 +17415,7 @@ interface HTMLMenuElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLMenuElement: {
+declare const HTMLMenuElement: {
   prototype: HTMLMenuElement;
   new (): HTMLMenuElement;
 };
@@ -17348,7 +17449,7 @@ interface HTMLMetaElement extends HTMLElement {
   scheme: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMetaElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMetaElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17358,7 +17459,7 @@ interface HTMLMetaElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMetaElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMetaElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17368,7 +17469,7 @@ interface HTMLMetaElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLMetaElement: {
+declare const HTMLMetaElement: {
   prototype: HTMLMetaElement;
   new (): HTMLMetaElement;
 };
@@ -17419,7 +17520,7 @@ interface HTMLMeterElement extends HTMLElement {
   value: number;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMeterElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMeterElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17429,7 +17530,7 @@ interface HTMLMeterElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLMeterElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLMeterElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17439,7 +17540,7 @@ interface HTMLMeterElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLMeterElement: {
+declare const HTMLMeterElement: {
   prototype: HTMLMeterElement;
   new (): HTMLMeterElement;
 };
@@ -17469,7 +17570,7 @@ interface HTMLModElement extends HTMLElement {
   dateTime: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLModElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLModElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17479,7 +17580,7 @@ interface HTMLModElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLModElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLModElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17489,7 +17590,7 @@ interface HTMLModElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLModElement: {
+declare const HTMLModElement: {
   prototype: HTMLModElement;
   new (): HTMLModElement;
 };
@@ -17528,7 +17629,7 @@ interface HTMLOListElement extends HTMLElement {
   type: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLOListElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLOListElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17538,7 +17639,7 @@ interface HTMLOListElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLOListElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLOListElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17548,7 +17649,7 @@ interface HTMLOListElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLOListElement: {
+declare const HTMLOListElement: {
   prototype: HTMLOListElement;
   new (): HTMLOListElement;
 };
@@ -17762,7 +17863,7 @@ interface HTMLObjectElement extends HTMLElement {
   setCustomValidity(error: string): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17772,7 +17873,7 @@ interface HTMLObjectElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17782,7 +17883,7 @@ interface HTMLObjectElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLObjectElement: {
+declare const HTMLObjectElement: {
   prototype: HTMLObjectElement;
   new (): HTMLObjectElement;
 };
@@ -17811,7 +17912,10 @@ interface HTMLOptGroupElement extends HTMLElement {
   label: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLOptGroupElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLOptGroupElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17821,7 +17925,10 @@ interface HTMLOptGroupElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLOptGroupElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLOptGroupElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17831,7 +17938,7 @@ interface HTMLOptGroupElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLOptGroupElement: {
+declare const HTMLOptGroupElement: {
   prototype: HTMLOptGroupElement;
   new (): HTMLOptGroupElement;
 };
@@ -17900,7 +18007,7 @@ interface HTMLOptionElement extends HTMLElement {
   value: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLOptionElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLOptionElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -17910,7 +18017,7 @@ interface HTMLOptionElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLOptionElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLOptionElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -17920,7 +18027,7 @@ interface HTMLOptionElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLOptionElement: {
+declare const HTMLOptionElement: {
   prototype: HTMLOptionElement;
   new (): HTMLOptionElement;
 };
@@ -17987,7 +18094,7 @@ interface HTMLOptionsCollection extends HTMLCollectionOf<HTMLOptionElement> {
   remove(index: number): void;
 }
 
-declare var HTMLOptionsCollection: {
+declare const HTMLOptionsCollection: {
   prototype: HTMLOptionsCollection;
   new (): HTMLOptionsCollection;
 };
@@ -18105,7 +18212,7 @@ interface HTMLOutputElement extends HTMLElement {
   setCustomValidity(error: string): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLOutputElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLOutputElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18115,7 +18222,7 @@ interface HTMLOutputElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLOutputElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLOutputElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18125,7 +18232,7 @@ interface HTMLOutputElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLOutputElement: {
+declare const HTMLOutputElement: {
   prototype: HTMLOutputElement;
   new (): HTMLOutputElement;
 };
@@ -18149,7 +18256,10 @@ interface HTMLParagraphElement extends HTMLElement {
   align: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLParagraphElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLParagraphElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18159,7 +18269,10 @@ interface HTMLParagraphElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLParagraphElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLParagraphElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18169,7 +18282,7 @@ interface HTMLParagraphElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLParagraphElement: {
+declare const HTMLParagraphElement: {
   prototype: HTMLParagraphElement;
   new (): HTMLParagraphElement;
 };
@@ -18223,7 +18336,7 @@ interface HTMLParamElement extends HTMLElement {
   valueType: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLParamElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLParamElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18233,7 +18346,7 @@ interface HTMLParamElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLParamElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLParamElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18244,7 +18357,7 @@ interface HTMLParamElement extends HTMLElement {
 }
 
 /** @deprecated */
-declare var HTMLParamElement: {
+declare const HTMLParamElement: {
   prototype: HTMLParamElement;
   new (): HTMLParamElement;
 };
@@ -18259,7 +18372,7 @@ declare var HTMLParamElement: {
 interface HTMLPictureElement extends HTMLElement {
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLPictureElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLPictureElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18269,7 +18382,7 @@ interface HTMLPictureElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLPictureElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLPictureElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18279,7 +18392,7 @@ interface HTMLPictureElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLPictureElement: {
+declare const HTMLPictureElement: {
   prototype: HTMLPictureElement;
   new (): HTMLPictureElement;
 };
@@ -18304,7 +18417,7 @@ interface HTMLPreElement extends HTMLElement {
   width: number;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLPreElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLPreElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18314,7 +18427,7 @@ interface HTMLPreElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLPreElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLPreElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18324,7 +18437,7 @@ interface HTMLPreElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLPreElement: {
+declare const HTMLPreElement: {
   prototype: HTMLPreElement;
   new (): HTMLPreElement;
 };
@@ -18369,7 +18482,10 @@ interface HTMLProgressElement extends HTMLElement {
   value: number;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLProgressElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLProgressElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18379,7 +18495,10 @@ interface HTMLProgressElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLProgressElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLProgressElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18389,7 +18508,7 @@ interface HTMLProgressElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLProgressElement: {
+declare const HTMLProgressElement: {
   prototype: HTMLProgressElement;
   new (): HTMLProgressElement;
 };
@@ -18411,7 +18530,7 @@ interface HTMLQuoteElement extends HTMLElement {
   cite: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLQuoteElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLQuoteElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18421,7 +18540,7 @@ interface HTMLQuoteElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLQuoteElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLQuoteElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18431,7 +18550,7 @@ interface HTMLQuoteElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLQuoteElement: {
+declare const HTMLQuoteElement: {
   prototype: HTMLQuoteElement;
   new (): HTMLQuoteElement;
 };
@@ -18489,7 +18608,7 @@ interface HTMLScriptElement extends HTMLElement {
   type: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLScriptElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLScriptElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18499,7 +18618,7 @@ interface HTMLScriptElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLScriptElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLScriptElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18509,7 +18628,7 @@ interface HTMLScriptElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLScriptElement: {
+declare const HTMLScriptElement: {
   prototype: HTMLScriptElement;
   new (): HTMLScriptElement;
   /**
@@ -18728,7 +18847,7 @@ interface HTMLSelectElement extends HTMLElement {
   showPicker(): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLSelectElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLSelectElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18738,7 +18857,7 @@ interface HTMLSelectElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLSelectElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLSelectElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18749,7 +18868,7 @@ interface HTMLSelectElement extends HTMLElement {
   [name: number]: HTMLOptionElement | HTMLOptGroupElement;
 }
 
-declare var HTMLSelectElement: {
+declare const HTMLSelectElement: {
   prototype: HTMLSelectElement;
   new (): HTMLSelectElement;
 };
@@ -18770,15 +18889,15 @@ interface HTMLSlotElement extends HTMLElement {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/assignedElements)
    */
-  assignedElements(options?: AssignedNodesOptions): Element[];
+  assignedElements(options?: AssignedNodesOptions): readonly Element[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/assignedNodes)
    */
-  assignedNodes(options?: AssignedNodesOptions): Node[];
+  assignedNodes(options?: AssignedNodesOptions): readonly Node[];
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLSlotElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLSlotElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18788,7 +18907,7 @@ interface HTMLSlotElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLSlotElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLSlotElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18798,7 +18917,7 @@ interface HTMLSlotElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLSlotElement: {
+declare const HTMLSlotElement: {
   prototype: HTMLSlotElement;
   new (): HTMLSlotElement;
 };
@@ -18846,7 +18965,7 @@ interface HTMLSourceElement extends HTMLElement {
   width: number;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLSourceElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLSourceElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18856,7 +18975,7 @@ interface HTMLSourceElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLSourceElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLSourceElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18866,7 +18985,7 @@ interface HTMLSourceElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLSourceElement: {
+declare const HTMLSourceElement: {
   prototype: HTMLSourceElement;
   new (): HTMLSourceElement;
 };
@@ -18880,7 +18999,7 @@ declare var HTMLSourceElement: {
 interface HTMLSpanElement extends HTMLElement {
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLSpanElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLSpanElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18890,7 +19009,7 @@ interface HTMLSpanElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLSpanElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLSpanElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18900,7 +19019,7 @@ interface HTMLSpanElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLSpanElement: {
+declare const HTMLSpanElement: {
   prototype: HTMLSpanElement;
   new (): HTMLSpanElement;
 };
@@ -18937,7 +19056,7 @@ interface HTMLStyleElement extends HTMLElement, LinkStyle {
   type: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLStyleElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLStyleElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18947,7 +19066,7 @@ interface HTMLStyleElement extends HTMLElement, LinkStyle {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLStyleElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLStyleElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -18957,7 +19076,7 @@ interface HTMLStyleElement extends HTMLElement, LinkStyle {
   ): void;
 }
 
-declare var HTMLStyleElement: {
+declare const HTMLStyleElement: {
   prototype: HTMLStyleElement;
   new (): HTMLStyleElement;
 };
@@ -18984,7 +19103,7 @@ interface HTMLTableCaptionElement extends HTMLElement {
     listener: (
       this: HTMLTableCaptionElement,
       ev: HTMLElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -18997,7 +19116,7 @@ interface HTMLTableCaptionElement extends HTMLElement {
     listener: (
       this: HTMLTableCaptionElement,
       ev: HTMLElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19007,7 +19126,7 @@ interface HTMLTableCaptionElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTableCaptionElement: {
+declare const HTMLTableCaptionElement: {
   prototype: HTMLTableCaptionElement;
   new (): HTMLTableCaptionElement;
 };
@@ -19143,7 +19262,10 @@ interface HTMLTableCellElement extends HTMLElement {
   width: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTableCellElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTableCellElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19153,7 +19275,10 @@ interface HTMLTableCellElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTableCellElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTableCellElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19163,7 +19288,7 @@ interface HTMLTableCellElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTableCellElement: {
+declare const HTMLTableCellElement: {
   prototype: HTMLTableCellElement;
   new (): HTMLTableCellElement;
 };
@@ -19226,7 +19351,10 @@ interface HTMLTableColElement extends HTMLElement {
   width: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTableColElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTableColElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19236,7 +19364,10 @@ interface HTMLTableColElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTableColElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTableColElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19246,7 +19377,7 @@ interface HTMLTableColElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTableColElement: {
+declare const HTMLTableColElement: {
   prototype: HTMLTableColElement;
   new (): HTMLTableColElement;
 };
@@ -19258,7 +19389,7 @@ interface HTMLTableDataCellElement extends HTMLTableCellElement {
     listener: (
       this: HTMLTableDataCellElement,
       ev: HTMLElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19271,7 +19402,7 @@ interface HTMLTableDataCellElement extends HTMLTableCellElement {
     listener: (
       this: HTMLTableDataCellElement,
       ev: HTMLElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19479,7 +19610,7 @@ interface HTMLTableElement extends HTMLElement {
   insertRow(index?: number): HTMLTableRowElement;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTableElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLTableElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19489,7 +19620,7 @@ interface HTMLTableElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTableElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLTableElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19499,7 +19630,7 @@ interface HTMLTableElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTableElement: {
+declare const HTMLTableElement: {
   prototype: HTMLTableElement;
   new (): HTMLTableElement;
 };
@@ -19511,7 +19642,7 @@ interface HTMLTableHeaderCellElement extends HTMLTableCellElement {
     listener: (
       this: HTMLTableHeaderCellElement,
       ev: HTMLElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19524,7 +19655,7 @@ interface HTMLTableHeaderCellElement extends HTMLTableCellElement {
     listener: (
       this: HTMLTableHeaderCellElement,
       ev: HTMLElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19627,7 +19758,10 @@ interface HTMLTableRowElement extends HTMLElement {
   insertCell(index?: number): HTMLTableCellElement;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTableRowElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTableRowElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19637,7 +19771,10 @@ interface HTMLTableRowElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTableRowElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTableRowElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19647,7 +19784,7 @@ interface HTMLTableRowElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTableRowElement: {
+declare const HTMLTableRowElement: {
   prototype: HTMLTableRowElement;
   new (): HTMLTableRowElement;
 };
@@ -19727,7 +19864,7 @@ interface HTMLTableSectionElement extends HTMLElement {
     listener: (
       this: HTMLTableSectionElement,
       ev: HTMLElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19740,7 +19877,7 @@ interface HTMLTableSectionElement extends HTMLElement {
     listener: (
       this: HTMLTableSectionElement,
       ev: HTMLElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19750,7 +19887,7 @@ interface HTMLTableSectionElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTableSectionElement: {
+declare const HTMLTableSectionElement: {
   prototype: HTMLTableSectionElement;
   new (): HTMLTableSectionElement;
 };
@@ -19772,7 +19909,10 @@ interface HTMLTemplateElement extends HTMLElement {
   shadowRootMode: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTemplateElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTemplateElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19782,7 +19922,10 @@ interface HTMLTemplateElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTemplateElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTemplateElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19792,7 +19935,7 @@ interface HTMLTemplateElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTemplateElement: {
+declare const HTMLTemplateElement: {
   prototype: HTMLTemplateElement;
   new (): HTMLTemplateElement;
 };
@@ -19919,7 +20062,10 @@ interface HTMLTextAreaElement extends HTMLElement {
   ): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTextAreaElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTextAreaElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19929,7 +20075,10 @@ interface HTMLTextAreaElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTextAreaElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (
+      this: HTMLTextAreaElement,
+      ev: HTMLElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19939,7 +20088,7 @@ interface HTMLTextAreaElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTextAreaElement: {
+declare const HTMLTextAreaElement: {
   prototype: HTMLTextAreaElement;
   new (): HTMLTextAreaElement;
 };
@@ -19958,7 +20107,7 @@ interface HTMLTimeElement extends HTMLElement {
   dateTime: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTimeElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLTimeElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -19968,7 +20117,7 @@ interface HTMLTimeElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTimeElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLTimeElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -19978,7 +20127,7 @@ interface HTMLTimeElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTimeElement: {
+declare const HTMLTimeElement: {
   prototype: HTMLTimeElement;
   new (): HTMLTimeElement;
 };
@@ -19999,7 +20148,7 @@ interface HTMLTitleElement extends HTMLElement {
   text: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTitleElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLTitleElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -20009,7 +20158,7 @@ interface HTMLTitleElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTitleElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLTitleElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -20019,7 +20168,7 @@ interface HTMLTitleElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTitleElement: {
+declare const HTMLTitleElement: {
   prototype: HTMLTitleElement;
   new (): HTMLTitleElement;
 };
@@ -20074,7 +20223,7 @@ interface HTMLTrackElement extends HTMLElement {
   readonly ERROR: 3;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTrackElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLTrackElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -20084,7 +20233,7 @@ interface HTMLTrackElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLTrackElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLTrackElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -20094,7 +20243,7 @@ interface HTMLTrackElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLTrackElement: {
+declare const HTMLTrackElement: {
   prototype: HTMLTrackElement;
   new (): HTMLTrackElement;
   readonly NONE: 0;
@@ -20127,7 +20276,7 @@ interface HTMLUListElement extends HTMLElement {
   type: string;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLUListElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLUListElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -20137,7 +20286,7 @@ interface HTMLUListElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLUListElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLUListElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -20147,7 +20296,7 @@ interface HTMLUListElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLUListElement: {
+declare const HTMLUListElement: {
   prototype: HTMLUListElement;
   new (): HTMLUListElement;
 };
@@ -20162,7 +20311,7 @@ declare var HTMLUListElement: {
 interface HTMLUnknownElement extends HTMLElement {
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLUnknownElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLUnknownElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -20172,7 +20321,7 @@ interface HTMLUnknownElement extends HTMLElement {
   ): void;
   removeEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
-    listener: (this: HTMLUnknownElement, ev: HTMLElementEventMap[K]) => any,
+    listener: (this: HTMLUnknownElement, ev: HTMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -20182,7 +20331,7 @@ interface HTMLUnknownElement extends HTMLElement {
   ): void;
 }
 
-declare var HTMLUnknownElement: {
+declare const HTMLUnknownElement: {
   prototype: HTMLUnknownElement;
   new (): HTMLUnknownElement;
 };
@@ -20215,12 +20364,16 @@ interface HTMLVideoElement extends HTMLMediaElement {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/enterpictureinpicture_event)
    */
-  onenterpictureinpicture: ((this: HTMLVideoElement, ev: Event) => any) | null;
+  onenterpictureinpicture:
+    | ((this: HTMLVideoElement, ev: Event) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/leavepictureinpicture_event)
    */
-  onleavepictureinpicture: ((this: HTMLVideoElement, ev: Event) => any) | null;
+  onleavepictureinpicture:
+    | ((this: HTMLVideoElement, ev: Event) => unknown)
+    | null;
   /**
    * Gets or sets the playsinline of the video element. for example, On iPhone,
    * video elements will now be allowed to play inline, and will not
@@ -20273,7 +20426,10 @@ interface HTMLVideoElement extends HTMLMediaElement {
   requestVideoFrameCallback(callback: VideoFrameRequestCallback): number;
   addEventListener<K extends keyof HTMLVideoElementEventMap>(
     type: K,
-    listener: (this: HTMLVideoElement, ev: HTMLVideoElementEventMap[K]) => any,
+    listener: (
+      this: HTMLVideoElement,
+      ev: HTMLVideoElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -20283,7 +20439,10 @@ interface HTMLVideoElement extends HTMLMediaElement {
   ): void;
   removeEventListener<K extends keyof HTMLVideoElementEventMap>(
     type: K,
-    listener: (this: HTMLVideoElement, ev: HTMLVideoElementEventMap[K]) => any,
+    listener: (
+      this: HTMLVideoElement,
+      ev: HTMLVideoElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -20293,7 +20452,7 @@ interface HTMLVideoElement extends HTMLMediaElement {
   ): void;
 }
 
-declare var HTMLVideoElement: {
+declare const HTMLVideoElement: {
   prototype: HTMLVideoElement;
   new (): HTMLVideoElement;
 };
@@ -20320,7 +20479,7 @@ interface HashChangeEvent extends Event {
   readonly oldURL: string;
 }
 
-declare var HashChangeEvent: {
+declare const HashChangeEvent: {
   prototype: HashChangeEvent;
   new (type: string, eventInitDict?: HashChangeEventInit): HashChangeEvent;
 };
@@ -20347,18 +20506,18 @@ interface Headers {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Headers/getSetCookie)
    */
-  getSetCookie(): string[];
+  getSetCookie(): readonly string[];
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/has) */
   has(name: string): boolean;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/set) */
   set(name: string, value: string): void;
   forEach(
     callbackfn: (value: string, key: string, parent: Headers) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var Headers: {
+declare const Headers: {
   prototype: Headers;
   new (init?: HeadersInit): Headers;
 };
@@ -20378,13 +20537,13 @@ interface Highlight {
       key: AbstractRange,
       parent: Highlight,
     ) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var Highlight: {
+declare const Highlight: {
   prototype: Highlight;
-  new (...initialRanges: AbstractRange[]): Highlight;
+  new (...initialRanges: readonly AbstractRange[]): Highlight;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/HighlightRegistry) */
@@ -20395,11 +20554,11 @@ interface HighlightRegistry {
       key: string,
       parent: HighlightRegistry,
     ) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var HighlightRegistry: {
+declare const HighlightRegistry: {
   prototype: HighlightRegistry;
   new (): HighlightRegistry;
 };
@@ -20419,7 +20578,7 @@ interface History {
    */
   scrollRestoration: ScrollRestoration;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/History/state) */
-  readonly state: any;
+  readonly state: unknown;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/History/back) */
   back(): void;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/History/forward) */
@@ -20430,15 +20589,15 @@ interface History {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/History/pushState)
    */
-  pushState(data: any, unused: string, url?: string | URL | null): void;
+  pushState(data: unknown, unused: string, url?: string | URL | null): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/History/replaceState)
    */
-  replaceState(data: any, unused: string, url?: string | URL | null): void;
+  replaceState(data: unknown, unused: string, url?: string | URL | null): void;
 }
 
-declare var History: {
+declare const History: {
   prototype: History;
   new (): History;
 };
@@ -20528,10 +20687,10 @@ interface IDBCursor {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBCursor/update)
    */
-  update(value: any): IDBRequest<IDBValidKey>;
+  update(value: unknown): IDBRequest<IDBValidKey>;
 }
 
-declare var IDBCursor: {
+declare const IDBCursor: {
   prototype: IDBCursor;
   new (): IDBCursor;
 };
@@ -20551,10 +20710,10 @@ interface IDBCursorWithValue extends IDBCursor {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBCursorWithValue/value)
    */
-  readonly value: any;
+  readonly value: unknown;
 }
 
-declare var IDBCursorWithValue: {
+declare const IDBCursorWithValue: {
   prototype: IDBCursorWithValue;
   new (): IDBCursorWithValue;
 };
@@ -20589,19 +20748,19 @@ interface IDBDatabase extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBDatabase/objectStoreNames)
    */
   readonly objectStoreNames: DOMStringList;
-  onabort: ((this: IDBDatabase, ev: Event) => any) | null;
+  onabort: ((this: IDBDatabase, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBDatabase/close_event)
    */
-  onclose: ((this: IDBDatabase, ev: Event) => any) | null;
-  onerror: ((this: IDBDatabase, ev: Event) => any) | null;
+  onclose: ((this: IDBDatabase, ev: Event) => unknown) | null;
+  onerror: ((this: IDBDatabase, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBDatabase/versionchange_event)
    */
   onversionchange:
-    | ((this: IDBDatabase, ev: IDBVersionChangeEvent) => any)
+    | ((this: IDBDatabase, ev: IDBVersionChangeEvent) => unknown)
     | null;
   /**
    * Returns the version of the database.
@@ -20649,13 +20808,13 @@ interface IDBDatabase extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBDatabase/transaction)
    */
   transaction(
-    storeNames: string | string[],
+    storeNames: string | readonly string[],
     mode?: IDBTransactionMode,
     options?: IDBTransactionOptions,
   ): IDBTransaction;
   addEventListener<K extends keyof IDBDatabaseEventMap>(
     type: K,
-    listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any,
+    listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -20665,7 +20824,7 @@ interface IDBDatabase extends EventTarget {
   ): void;
   removeEventListener<K extends keyof IDBDatabaseEventMap>(
     type: K,
-    listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any,
+    listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -20675,7 +20834,7 @@ interface IDBDatabase extends EventTarget {
   ): void;
 }
 
-declare var IDBDatabase: {
+declare const IDBDatabase: {
   prototype: IDBDatabase;
   new (): IDBDatabase;
 };
@@ -20696,12 +20855,12 @@ interface IDBFactory {
    *
    * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBFactory/cmp)
    */
-  cmp(first: any, second: any): number;
+  cmp(first: unknown, second: unknown): number;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBFactory/databases)
    */
-  databases(): Promise<IDBDatabaseInfo[]>;
+  databases(): Promise<readonly IDBDatabaseInfo[]>;
   /**
    * Attempts to delete the named database. If the database already exists and
    * there are open connections that don't close in response to a versionchange
@@ -20722,7 +20881,7 @@ interface IDBFactory {
   open(name: string, version?: number): IDBOpenDBRequest;
 }
 
-declare var IDBFactory: {
+declare const IDBFactory: {
   prototype: IDBFactory;
   new (): IDBFactory;
 };
@@ -20740,7 +20899,7 @@ interface IDBIndex {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBIndex/keyPath)
    */
-  readonly keyPath: string | string[];
+  readonly keyPath: string | readonly string[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBIndex/multiEntry)
@@ -20779,7 +20938,7 @@ interface IDBIndex {
    *
    * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBIndex/get)
    */
-  get(query: IDBValidKey | IDBKeyRange): IDBRequest<any>;
+  get(query: IDBValidKey | IDBKeyRange): IDBRequest<unknown>;
   /**
    * Retrieves the values of the records matching the given key or key range in
    * query (up to count if given).
@@ -20791,7 +20950,7 @@ interface IDBIndex {
   getAll(
     query?: IDBValidKey | IDBKeyRange | null,
     count?: number,
-  ): IDBRequest<any[]>;
+  ): IDBRequest<readonly unknown[]>;
   /**
    * Retrieves the keys of records matching the given key or key range in query
    * (up to count if given).
@@ -20804,7 +20963,7 @@ interface IDBIndex {
   getAllKeys(
     query?: IDBValidKey | IDBKeyRange | null,
     count?: number,
-  ): IDBRequest<IDBValidKey[]>;
+  ): IDBRequest<readonly IDBValidKey[]>;
   /**
    * Retrieves the key of the first record matching the given key or key range
    * in query.
@@ -20845,7 +21004,7 @@ interface IDBIndex {
   ): IDBRequest<IDBCursor | null>;
 }
 
-declare var IDBIndex: {
+declare const IDBIndex: {
   prototype: IDBIndex;
   new (): IDBIndex;
 };
@@ -20867,7 +21026,7 @@ interface IDBKeyRange {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBKeyRange/lower)
    */
-  readonly lower: any;
+  readonly lower: unknown;
   /**
    * Returns true if the lower open flag is set, and false otherwise.
    *
@@ -20881,7 +21040,7 @@ interface IDBKeyRange {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBKeyRange/upper)
    */
-  readonly upper: any;
+  readonly upper: unknown;
   /**
    * Returns true if the upper open flag is set, and false otherwise.
    *
@@ -20895,10 +21054,10 @@ interface IDBKeyRange {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBKeyRange/includes)
    */
-  includes(key: any): boolean;
+  includes(key: unknown): boolean;
 }
 
-declare var IDBKeyRange: {
+declare const IDBKeyRange: {
   prototype: IDBKeyRange;
   new (): IDBKeyRange;
   /**
@@ -20910,8 +21069,8 @@ declare var IDBKeyRange: {
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBKeyRange/bound_static)
    */
   bound(
-    lower: any,
-    upper: any,
+    lower: unknown,
+    upper: unknown,
     lowerOpen?: boolean,
     upperOpen?: boolean,
   ): IDBKeyRange;
@@ -20922,14 +21081,14 @@ declare var IDBKeyRange: {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBKeyRange/lowerBound_static)
    */
-  lowerBound(lower: any, open?: boolean): IDBKeyRange;
+  lowerBound(lower: unknown, open?: boolean): IDBKeyRange;
   /**
    * Returns a new IDBKeyRange spanning only key.
    *
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBKeyRange/only_static)
    */
-  only(value: any): IDBKeyRange;
+  only(value: unknown): IDBKeyRange;
   /**
    * Returns a new IDBKeyRange with no lower bound and ending at key. If open is
    * true, key is not included in the range.
@@ -20937,7 +21096,7 @@ declare var IDBKeyRange: {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBKeyRange/upperBound_static)
    */
-  upperBound(upper: any, open?: boolean): IDBKeyRange;
+  upperBound(upper: unknown, open?: boolean): IDBKeyRange;
 };
 
 /**
@@ -20970,7 +21129,7 @@ interface IDBObjectStore {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/keyPath)
    */
-  readonly keyPath: string | string[];
+  readonly keyPath: string | readonly string[];
   /**
    * Returns the name of the store.
    *
@@ -21000,7 +21159,7 @@ interface IDBObjectStore {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/add)
    */
-  add(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey>;
+  add(value: unknown, key?: IDBValidKey): IDBRequest<IDBValidKey>;
   /**
    * Deletes all records in store.
    *
@@ -21034,7 +21193,7 @@ interface IDBObjectStore {
    */
   createIndex(
     name: string,
-    keyPath: string | string[],
+    keyPath: string | readonly string[],
     options?: IDBIndexParameters,
   ): IDBIndex;
   /**
@@ -21067,7 +21226,7 @@ interface IDBObjectStore {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/get)
    */
-  get(query: IDBValidKey | IDBKeyRange): IDBRequest<any>;
+  get(query: IDBValidKey | IDBKeyRange): IDBRequest<unknown>;
   /**
    * Retrieves the values of the records matching the given key or key range in
    * query (up to count if given).
@@ -21080,7 +21239,7 @@ interface IDBObjectStore {
   getAll(
     query?: IDBValidKey | IDBKeyRange | null,
     count?: number,
-  ): IDBRequest<any[]>;
+  ): IDBRequest<readonly unknown[]>;
   /**
    * Retrieves the keys of records matching the given key or key range in query
    * (up to count if given).
@@ -21093,7 +21252,7 @@ interface IDBObjectStore {
   getAllKeys(
     query?: IDBValidKey | IDBKeyRange | null,
     count?: number,
-  ): IDBRequest<IDBValidKey[]>;
+  ): IDBRequest<readonly IDBValidKey[]>;
   /**
    * Retrieves the key of the first record matching the given key or key range
    * in query.
@@ -21153,10 +21312,10 @@ interface IDBObjectStore {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/put)
    */
-  put(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey>;
+  put(value: unknown, key?: IDBValidKey): IDBRequest<IDBValidKey>;
 }
 
-declare var IDBObjectStore: {
+declare const IDBObjectStore: {
   prototype: IDBObjectStore;
   new (): IDBObjectStore;
 };
@@ -21177,18 +21336,21 @@ interface IDBOpenDBRequest extends IDBRequest<IDBDatabase> {
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBOpenDBRequest/blocked_event)
    */
   onblocked:
-    | ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any)
+    | ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event)
    */
   onupgradeneeded:
-    | ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any)
+    | ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown)
     | null;
   addEventListener<K extends keyof IDBOpenDBRequestEventMap>(
     type: K,
-    listener: (this: IDBOpenDBRequest, ev: IDBOpenDBRequestEventMap[K]) => any,
+    listener: (
+      this: IDBOpenDBRequest,
+      ev: IDBOpenDBRequestEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -21198,7 +21360,10 @@ interface IDBOpenDBRequest extends IDBRequest<IDBDatabase> {
   ): void;
   removeEventListener<K extends keyof IDBOpenDBRequestEventMap>(
     type: K,
-    listener: (this: IDBOpenDBRequest, ev: IDBOpenDBRequestEventMap[K]) => any,
+    listener: (
+      this: IDBOpenDBRequest,
+      ev: IDBOpenDBRequestEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -21208,7 +21373,7 @@ interface IDBOpenDBRequest extends IDBRequest<IDBDatabase> {
   ): void;
 }
 
-declare var IDBOpenDBRequest: {
+declare const IDBOpenDBRequest: {
   prototype: IDBOpenDBRequest;
   new (): IDBOpenDBRequest;
 };
@@ -21226,7 +21391,7 @@ interface IDBRequestEventMap {
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest)
  */
-interface IDBRequest<T = any> extends EventTarget {
+interface IDBRequest<T = unknown> extends EventTarget {
   /**
    * When a request is completed, returns the error (a DOMException), or null if
    * the request succeeded. Throws a "InvalidStateError" DOMException if the
@@ -21240,12 +21405,12 @@ interface IDBRequest<T = any> extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/error_event)
    */
-  onerror: ((this: IDBRequest<T>, ev: Event) => any) | null;
+  onerror: ((this: IDBRequest<T>, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBRequest/success_event)
    */
-  onsuccess: ((this: IDBRequest<T>, ev: Event) => any) | null;
+  onsuccess: ((this: IDBRequest<T>, ev: Event) => unknown) | null;
   /**
    * Returns "pending" until a request is complete, then returns "done".
    *
@@ -21281,7 +21446,7 @@ interface IDBRequest<T = any> extends EventTarget {
   readonly transaction: IDBTransaction | null;
   addEventListener<K extends keyof IDBRequestEventMap>(
     type: K,
-    listener: (this: IDBRequest<T>, ev: IDBRequestEventMap[K]) => any,
+    listener: (this: IDBRequest<T>, ev: IDBRequestEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -21291,7 +21456,7 @@ interface IDBRequest<T = any> extends EventTarget {
   ): void;
   removeEventListener<K extends keyof IDBRequestEventMap>(
     type: K,
-    listener: (this: IDBRequest<T>, ev: IDBRequestEventMap[K]) => any,
+    listener: (this: IDBRequest<T>, ev: IDBRequestEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -21301,7 +21466,7 @@ interface IDBRequest<T = any> extends EventTarget {
   ): void;
 }
 
-declare var IDBRequest: {
+declare const IDBRequest: {
   prototype: IDBRequest;
   new (): IDBRequest;
 };
@@ -21354,17 +21519,17 @@ interface IDBTransaction extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBTransaction/abort_event)
    */
-  onabort: ((this: IDBTransaction, ev: Event) => any) | null;
+  onabort: ((this: IDBTransaction, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBTransaction/complete_event)
    */
-  oncomplete: ((this: IDBTransaction, ev: Event) => any) | null;
+  oncomplete: ((this: IDBTransaction, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IDBTransaction/error_event)
    */
-  onerror: ((this: IDBTransaction, ev: Event) => any) | null;
+  onerror: ((this: IDBTransaction, ev: Event) => unknown) | null;
   /**
    * Aborts the transaction. All pending requests will fail with a "AbortError"
    * DOMException and all changes made to the database will be reverted.
@@ -21387,7 +21552,7 @@ interface IDBTransaction extends EventTarget {
   objectStore(name: string): IDBObjectStore;
   addEventListener<K extends keyof IDBTransactionEventMap>(
     type: K,
-    listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any,
+    listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -21397,7 +21562,7 @@ interface IDBTransaction extends EventTarget {
   ): void;
   removeEventListener<K extends keyof IDBTransactionEventMap>(
     type: K,
-    listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any,
+    listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -21407,7 +21572,7 @@ interface IDBTransaction extends EventTarget {
   ): void;
 }
 
-declare var IDBTransaction: {
+declare const IDBTransaction: {
   prototype: IDBTransaction;
   new (): IDBTransaction;
 };
@@ -21433,7 +21598,7 @@ interface IDBVersionChangeEvent extends Event {
   readonly oldVersion: number;
 }
 
-declare var IDBVersionChangeEvent: {
+declare const IDBVersionChangeEvent: {
   prototype: IDBVersionChangeEvent;
   new (
     type: string,
@@ -21462,7 +21627,7 @@ interface IIRFilterNode extends AudioNode {
   ): void;
 }
 
-declare var IIRFilterNode: {
+declare const IIRFilterNode: {
   prototype: IIRFilterNode;
   new (context: BaseAudioContext, options: IIRFilterOptions): IIRFilterNode;
 };
@@ -21481,7 +21646,7 @@ interface IdleDeadline {
   timeRemaining(): DOMHighResTimeStamp;
 }
 
-declare var IdleDeadline: {
+declare const IdleDeadline: {
   prototype: IdleDeadline;
   new (): IdleDeadline;
 };
@@ -21511,7 +21676,7 @@ interface ImageBitmap {
   close(): void;
 }
 
-declare var ImageBitmap: {
+declare const ImageBitmap: {
   prototype: ImageBitmap;
   new (): ImageBitmap;
 };
@@ -21534,7 +21699,7 @@ interface ImageBitmapRenderingContext {
   transferFromImageBitmap(bitmap: ImageBitmap | null): void;
 }
 
-declare var ImageBitmapRenderingContext: {
+declare const ImageBitmapRenderingContext: {
   prototype: ImageBitmapRenderingContext;
   new (): ImageBitmapRenderingContext;
 };
@@ -21578,7 +21743,7 @@ interface ImageData {
   readonly width: number;
 }
 
-declare var ImageData: {
+declare const ImageData: {
   prototype: ImageData;
   new (sw: number, sh: number, settings?: ImageDataSettings): ImageData;
   new (
@@ -21610,7 +21775,7 @@ interface InputDeviceInfo extends MediaDeviceInfo {
   getCapabilities(): MediaTrackCapabilities;
 }
 
-declare var InputDeviceInfo: {
+declare const InputDeviceInfo: {
   prototype: InputDeviceInfo;
   new (): InputDeviceInfo;
 };
@@ -21638,10 +21803,10 @@ interface InputEvent extends UIEvent {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/InputEvent/getTargetRanges)
    */
-  getTargetRanges(): StaticRange[];
+  getTargetRanges(): readonly StaticRange[];
 }
 
-declare var InputEvent: {
+declare const InputEvent: {
   prototype: InputEvent;
   new (type: string, eventInitDict?: InputEventInit): InputEvent;
 };
@@ -21684,7 +21849,7 @@ interface IntersectionObserver {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserver/takeRecords)
    */
-  takeRecords(): IntersectionObserverEntry[];
+  takeRecords(): readonly IntersectionObserverEntry[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserver/unobserve)
@@ -21692,7 +21857,7 @@ interface IntersectionObserver {
   unobserve(target: Element): void;
 }
 
-declare var IntersectionObserver: {
+declare const IntersectionObserver: {
   prototype: IntersectionObserver;
   new (
     callback: IntersectionObserverCallback,
@@ -21746,7 +21911,7 @@ interface IntersectionObserverEntry {
   readonly time: DOMHighResTimeStamp;
 }
 
-declare var IntersectionObserverEntry: {
+declare const IntersectionObserverEntry: {
   prototype: IntersectionObserverEntry;
   new (
     intersectionObserverEntryInit: IntersectionObserverEntryInit,
@@ -21857,7 +22022,7 @@ interface KeyboardEvent extends UIEvent {
   readonly DOM_KEY_LOCATION_NUMPAD: 0x03;
 }
 
-declare var KeyboardEvent: {
+declare const KeyboardEvent: {
   prototype: KeyboardEvent;
   new (type: string, eventInitDict?: KeyboardEventInit): KeyboardEvent;
   readonly DOM_KEY_LOCATION_STANDARD: 0x00;
@@ -21892,19 +22057,21 @@ interface KeyframeEffect extends AnimationEffect {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/KeyframeEffect/getKeyframes)
    */
-  getKeyframes(): ComputedKeyframe[];
+  getKeyframes(): readonly ComputedKeyframe[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/KeyframeEffect/setKeyframes)
    */
-  setKeyframes(keyframes: Keyframe[] | PropertyIndexedKeyframes | null): void;
+  setKeyframes(
+    keyframes: readonly Keyframe[] | PropertyIndexedKeyframes | null,
+  ): void;
 }
 
-declare var KeyframeEffect: {
+declare const KeyframeEffect: {
   prototype: KeyframeEffect;
   new (
     target: Element | null,
-    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
+    keyframes: readonly Keyframe[] | PropertyIndexedKeyframes | null,
     options?: number | KeyframeEffectOptions,
   ): KeyframeEffect;
   new (source: KeyframeEffect): KeyframeEffect;
@@ -22037,7 +22204,7 @@ interface Location {
   replace(url: string | URL): void;
 }
 
-declare var Location: {
+declare const Location: {
   prototype: Location;
   new (): Location;
 };
@@ -22054,7 +22221,7 @@ interface Lock {
   readonly name: string;
 }
 
-declare var Lock: {
+declare const Lock: {
   prototype: Lock;
   new (): Lock;
 };
@@ -22074,15 +22241,15 @@ interface LockManager {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/LockManager/request)
    */
-  request(name: string, callback: LockGrantedCallback): Promise<any>;
+  request(name: string, callback: LockGrantedCallback): Promise<unknown>;
   request(
     name: string,
     options: LockOptions,
     callback: LockGrantedCallback,
-  ): Promise<any>;
+  ): Promise<unknown>;
 }
 
-declare var LockManager: {
+declare const LockManager: {
   prototype: LockManager;
   new (): LockManager;
 };
@@ -22106,7 +22273,7 @@ interface MIDIAccess extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MIDIAccess/statechange_event)
    */
-  onstatechange: ((this: MIDIAccess, ev: Event) => any) | null;
+  onstatechange: ((this: MIDIAccess, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MIDIAccess/outputs)
@@ -22119,7 +22286,7 @@ interface MIDIAccess extends EventTarget {
   readonly sysexEnabled: boolean;
   addEventListener<K extends keyof MIDIAccessEventMap>(
     type: K,
-    listener: (this: MIDIAccess, ev: MIDIAccessEventMap[K]) => any,
+    listener: (this: MIDIAccess, ev: MIDIAccessEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -22129,7 +22296,7 @@ interface MIDIAccess extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MIDIAccessEventMap>(
     type: K,
-    listener: (this: MIDIAccess, ev: MIDIAccessEventMap[K]) => any,
+    listener: (this: MIDIAccess, ev: MIDIAccessEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -22139,7 +22306,7 @@ interface MIDIAccess extends EventTarget {
   ): void;
 }
 
-declare var MIDIAccess: {
+declare const MIDIAccess: {
   prototype: MIDIAccess;
   new (): MIDIAccess;
 };
@@ -22158,7 +22325,7 @@ interface MIDIConnectionEvent extends Event {
   readonly port: MIDIPort | null;
 }
 
-declare var MIDIConnectionEvent: {
+declare const MIDIConnectionEvent: {
   prototype: MIDIConnectionEvent;
   new (
     type: string,
@@ -22180,10 +22347,10 @@ interface MIDIInput extends MIDIPort {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MIDIInput/midimessage_event)
    */
-  onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => any) | null;
+  onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => unknown) | null;
   addEventListener<K extends keyof MIDIInputEventMap>(
     type: K,
-    listener: (this: MIDIInput, ev: MIDIInputEventMap[K]) => any,
+    listener: (this: MIDIInput, ev: MIDIInputEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -22193,7 +22360,7 @@ interface MIDIInput extends MIDIPort {
   ): void;
   removeEventListener<K extends keyof MIDIInputEventMap>(
     type: K,
-    listener: (this: MIDIInput, ev: MIDIInputEventMap[K]) => any,
+    listener: (this: MIDIInput, ev: MIDIInputEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -22203,7 +22370,7 @@ interface MIDIInput extends MIDIPort {
   ): void;
 }
 
-declare var MIDIInput: {
+declare const MIDIInput: {
   prototype: MIDIInput;
   new (): MIDIInput;
 };
@@ -22216,11 +22383,11 @@ declare var MIDIInput: {
 interface MIDIInputMap {
   forEach(
     callbackfn: (value: MIDIInput, key: string, parent: MIDIInputMap) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var MIDIInputMap: {
+declare const MIDIInputMap: {
   prototype: MIDIInputMap;
   new (): MIDIInputMap;
 };
@@ -22238,7 +22405,7 @@ interface MIDIMessageEvent extends Event {
   readonly data: Uint8Array | null;
 }
 
-declare var MIDIMessageEvent: {
+declare const MIDIMessageEvent: {
   prototype: MIDIMessageEvent;
   new (type: string, eventInitDict?: MIDIMessageEventInit): MIDIMessageEvent;
 };
@@ -22250,10 +22417,10 @@ declare var MIDIMessageEvent: {
  */
 interface MIDIOutput extends MIDIPort {
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MIDIOutput/send) */
-  send(data: number[], timestamp?: DOMHighResTimeStamp): void;
+  send(data: readonly number[], timestamp?: DOMHighResTimeStamp): void;
   addEventListener<K extends keyof MIDIPortEventMap>(
     type: K,
-    listener: (this: MIDIOutput, ev: MIDIPortEventMap[K]) => any,
+    listener: (this: MIDIOutput, ev: MIDIPortEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -22263,7 +22430,7 @@ interface MIDIOutput extends MIDIPort {
   ): void;
   removeEventListener<K extends keyof MIDIPortEventMap>(
     type: K,
-    listener: (this: MIDIOutput, ev: MIDIPortEventMap[K]) => any,
+    listener: (this: MIDIOutput, ev: MIDIPortEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -22273,7 +22440,7 @@ interface MIDIOutput extends MIDIPort {
   ): void;
 }
 
-declare var MIDIOutput: {
+declare const MIDIOutput: {
   prototype: MIDIOutput;
   new (): MIDIOutput;
 };
@@ -22286,11 +22453,11 @@ declare var MIDIOutput: {
 interface MIDIOutputMap {
   forEach(
     callbackfn: (value: MIDIOutput, key: string, parent: MIDIOutputMap) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var MIDIOutputMap: {
+declare const MIDIOutputMap: {
   prototype: MIDIOutputMap;
   new (): MIDIOutputMap;
 };
@@ -22323,7 +22490,7 @@ interface MIDIPort extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MIDIPort/statechange_event)
    */
-  onstatechange: ((this: MIDIPort, ev: MIDIConnectionEvent) => any) | null;
+  onstatechange: ((this: MIDIPort, ev: MIDIConnectionEvent) => unknown) | null;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MIDIPort/state) */
   readonly state: MIDIPortDeviceState;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MIDIPort/type) */
@@ -22339,7 +22506,7 @@ interface MIDIPort extends EventTarget {
   open(): Promise<MIDIPort>;
   addEventListener<K extends keyof MIDIPortEventMap>(
     type: K,
-    listener: (this: MIDIPort, ev: MIDIPortEventMap[K]) => any,
+    listener: (this: MIDIPort, ev: MIDIPortEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -22349,7 +22516,7 @@ interface MIDIPort extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MIDIPortEventMap>(
     type: K,
-    listener: (this: MIDIPort, ev: MIDIPortEventMap[K]) => any,
+    listener: (this: MIDIPort, ev: MIDIPortEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -22359,7 +22526,7 @@ interface MIDIPort extends EventTarget {
   ): void;
 }
 
-declare var MIDIPort: {
+declare const MIDIPort: {
   prototype: MIDIPort;
   new (): MIDIPort;
 };
@@ -22376,7 +22543,7 @@ interface MathMLElement
     HTMLOrSVGElement {
   addEventListener<K extends keyof MathMLElementEventMap>(
     type: K,
-    listener: (this: MathMLElement, ev: MathMLElementEventMap[K]) => any,
+    listener: (this: MathMLElement, ev: MathMLElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -22386,7 +22553,7 @@ interface MathMLElement
   ): void;
   removeEventListener<K extends keyof MathMLElementEventMap>(
     type: K,
-    listener: (this: MathMLElement, ev: MathMLElementEventMap[K]) => any,
+    listener: (this: MathMLElement, ev: MathMLElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -22396,7 +22563,7 @@ interface MathMLElement
   ): void;
 }
 
-declare var MathMLElement: {
+declare const MathMLElement: {
   prototype: MathMLElement;
   new (): MathMLElement;
 };
@@ -22419,7 +22586,7 @@ interface MediaCapabilities {
   ): Promise<MediaCapabilitiesEncodingInfo>;
 }
 
-declare var MediaCapabilities: {
+declare const MediaCapabilities: {
   prototype: MediaCapabilities;
   new (): MediaCapabilities;
 };
@@ -22455,10 +22622,10 @@ interface MediaDeviceInfo {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaDeviceInfo/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var MediaDeviceInfo: {
+declare const MediaDeviceInfo: {
   prototype: MediaDeviceInfo;
   new (): MediaDeviceInfo;
 };
@@ -22479,12 +22646,12 @@ interface MediaDevices extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaDevices/devicechange_event)
    */
-  ondevicechange: ((this: MediaDevices, ev: Event) => any) | null;
+  ondevicechange: ((this: MediaDevices, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaDevices/enumerateDevices)
    */
-  enumerateDevices(): Promise<MediaDeviceInfo[]>;
+  enumerateDevices(): Promise<readonly MediaDeviceInfo[]>;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaDevices/getDisplayMedia)
@@ -22502,7 +22669,7 @@ interface MediaDevices extends EventTarget {
   getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
   addEventListener<K extends keyof MediaDevicesEventMap>(
     type: K,
-    listener: (this: MediaDevices, ev: MediaDevicesEventMap[K]) => any,
+    listener: (this: MediaDevices, ev: MediaDevicesEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -22512,7 +22679,7 @@ interface MediaDevices extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MediaDevicesEventMap>(
     type: K,
-    listener: (this: MediaDevices, ev: MediaDevicesEventMap[K]) => any,
+    listener: (this: MediaDevices, ev: MediaDevicesEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -22522,7 +22689,7 @@ interface MediaDevices extends EventTarget {
   ): void;
 }
 
-declare var MediaDevices: {
+declare const MediaDevices: {
   prototype: MediaDevices;
   new (): MediaDevices;
 };
@@ -22545,7 +22712,7 @@ interface MediaElementAudioSourceNode extends AudioNode {
   readonly mediaElement: HTMLMediaElement;
 }
 
-declare var MediaElementAudioSourceNode: {
+declare const MediaElementAudioSourceNode: {
   prototype: MediaElementAudioSourceNode;
   new (
     context: AudioContext,
@@ -22570,7 +22737,7 @@ interface MediaEncryptedEvent extends Event {
   readonly initDataType: string;
 }
 
-declare var MediaEncryptedEvent: {
+declare const MediaEncryptedEvent: {
   prototype: MediaEncryptedEvent;
   new (
     type: string,
@@ -22598,7 +22765,7 @@ interface MediaError {
   readonly MEDIA_ERR_SRC_NOT_SUPPORTED: 4;
 }
 
-declare var MediaError: {
+declare const MediaError: {
   prototype: MediaError;
   new (): MediaError;
   readonly MEDIA_ERR_ABORTED: 1;
@@ -22628,7 +22795,7 @@ interface MediaKeyMessageEvent extends Event {
   readonly messageType: MediaKeyMessageType;
 }
 
-declare var MediaKeyMessageEvent: {
+declare const MediaKeyMessageEvent: {
   prototype: MediaKeyMessageEvent;
   new (
     type: string,
@@ -22668,12 +22835,14 @@ interface MediaKeySession extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaKeySession/keystatuseschange_event)
    */
-  onkeystatuseschange: ((this: MediaKeySession, ev: Event) => any) | null;
+  onkeystatuseschange: ((this: MediaKeySession, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaKeySession/message_event)
    */
-  onmessage: ((this: MediaKeySession, ev: MediaKeyMessageEvent) => any) | null;
+  onmessage:
+    | ((this: MediaKeySession, ev: MediaKeyMessageEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaKeySession/sessionId)
@@ -22706,7 +22875,10 @@ interface MediaKeySession extends EventTarget {
   update(response: BufferSource): Promise<void>;
   addEventListener<K extends keyof MediaKeySessionEventMap>(
     type: K,
-    listener: (this: MediaKeySession, ev: MediaKeySessionEventMap[K]) => any,
+    listener: (
+      this: MediaKeySession,
+      ev: MediaKeySessionEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -22716,7 +22888,10 @@ interface MediaKeySession extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MediaKeySessionEventMap>(
     type: K,
-    listener: (this: MediaKeySession, ev: MediaKeySessionEventMap[K]) => any,
+    listener: (
+      this: MediaKeySession,
+      ev: MediaKeySessionEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -22726,7 +22901,7 @@ interface MediaKeySession extends EventTarget {
   ): void;
 }
 
-declare var MediaKeySession: {
+declare const MediaKeySession: {
   prototype: MediaKeySession;
   new (): MediaKeySession;
 };
@@ -22759,11 +22934,11 @@ interface MediaKeyStatusMap {
       key: BufferSource,
       parent: MediaKeyStatusMap,
     ) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var MediaKeyStatusMap: {
+declare const MediaKeyStatusMap: {
   prototype: MediaKeyStatusMap;
   new (): MediaKeyStatusMap;
 };
@@ -22795,7 +22970,7 @@ interface MediaKeySystemAccess {
   getConfiguration(): MediaKeySystemConfiguration;
 }
 
-declare var MediaKeySystemAccess: {
+declare const MediaKeySystemAccess: {
   prototype: MediaKeySystemAccess;
   new (): MediaKeySystemAccess;
 };
@@ -22820,7 +22995,7 @@ interface MediaKeys {
   setServerCertificate(serverCertificate: BufferSource): Promise<boolean>;
 }
 
-declare var MediaKeys: {
+declare const MediaKeys: {
   prototype: MediaKeys;
   new (): MediaKeys;
 };
@@ -22853,7 +23028,7 @@ interface MediaList {
   [index: number]: string;
 }
 
-declare var MediaList: {
+declare const MediaList: {
   prototype: MediaList;
   new (): MediaList;
 };
@@ -22882,7 +23057,7 @@ interface MediaMetadata {
   title: string;
 }
 
-declare var MediaMetadata: {
+declare const MediaMetadata: {
   prototype: MediaMetadata;
   new (init?: MediaMetadataInit): MediaMetadata;
 };
@@ -22913,7 +23088,7 @@ interface MediaQueryList extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaQueryList/change_event)
    */
-  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
+  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null;
   /**
    * @deprecated
    *
@@ -22921,7 +23096,9 @@ interface MediaQueryList extends EventTarget {
    *   Reference](https://developer.mozilla.org/docs/Web/API/MediaQueryList/addListener)
    */
   addListener(
-    callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null,
+    callback:
+      | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
+      | null,
   ): void;
   /**
    * @deprecated
@@ -22930,11 +23107,13 @@ interface MediaQueryList extends EventTarget {
    *   Reference](https://developer.mozilla.org/docs/Web/API/MediaQueryList/removeListener)
    */
   removeListener(
-    callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null,
+    callback:
+      | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
+      | null,
   ): void;
   addEventListener<K extends keyof MediaQueryListEventMap>(
     type: K,
-    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any,
+    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -22944,7 +23123,7 @@ interface MediaQueryList extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MediaQueryListEventMap>(
     type: K,
-    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any,
+    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -22954,7 +23133,7 @@ interface MediaQueryList extends EventTarget {
   ): void;
 }
 
-declare var MediaQueryList: {
+declare const MediaQueryList: {
   prototype: MediaQueryList;
   new (): MediaQueryList;
 };
@@ -22976,7 +23155,7 @@ interface MediaQueryListEvent extends Event {
   readonly media: string;
 }
 
-declare var MediaQueryListEvent: {
+declare const MediaQueryListEvent: {
   prototype: MediaQueryListEvent;
   new (
     type: string,
@@ -23009,32 +23188,32 @@ interface MediaRecorder extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaRecorder/dataavailable_event)
    */
-  ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => any) | null;
+  ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaRecorder/error_event)
    */
-  onerror: ((this: MediaRecorder, ev: Event) => any) | null;
+  onerror: ((this: MediaRecorder, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaRecorder/pause_event)
    */
-  onpause: ((this: MediaRecorder, ev: Event) => any) | null;
+  onpause: ((this: MediaRecorder, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaRecorder/resume_event)
    */
-  onresume: ((this: MediaRecorder, ev: Event) => any) | null;
+  onresume: ((this: MediaRecorder, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaRecorder/start_event)
    */
-  onstart: ((this: MediaRecorder, ev: Event) => any) | null;
+  onstart: ((this: MediaRecorder, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaRecorder/stop_event)
    */
-  onstop: ((this: MediaRecorder, ev: Event) => any) | null;
+  onstop: ((this: MediaRecorder, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaRecorder/state)
@@ -23077,7 +23256,7 @@ interface MediaRecorder extends EventTarget {
   stop(): void;
   addEventListener<K extends keyof MediaRecorderEventMap>(
     type: K,
-    listener: (this: MediaRecorder, ev: MediaRecorderEventMap[K]) => any,
+    listener: (this: MediaRecorder, ev: MediaRecorderEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -23087,7 +23266,7 @@ interface MediaRecorder extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MediaRecorderEventMap>(
     type: K,
-    listener: (this: MediaRecorder, ev: MediaRecorderEventMap[K]) => any,
+    listener: (this: MediaRecorder, ev: MediaRecorderEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -23097,7 +23276,7 @@ interface MediaRecorder extends EventTarget {
   ): void;
 }
 
-declare var MediaRecorder: {
+declare const MediaRecorder: {
   prototype: MediaRecorder;
   new (stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;
   /**
@@ -23134,7 +23313,7 @@ interface MediaSession {
   setPositionState(state?: MediaPositionState): void;
 }
 
-declare var MediaSession: {
+declare const MediaSession: {
   prototype: MediaSession;
   new (): MediaSession;
 };
@@ -23167,17 +23346,17 @@ interface MediaSource extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/sourceclose_event)
    */
-  onsourceclose: ((this: MediaSource, ev: Event) => any) | null;
+  onsourceclose: ((this: MediaSource, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/sourceended_event)
    */
-  onsourceended: ((this: MediaSource, ev: Event) => any) | null;
+  onsourceended: ((this: MediaSource, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/sourceopen_event)
    */
-  onsourceopen: ((this: MediaSource, ev: Event) => any) | null;
+  onsourceopen: ((this: MediaSource, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/readyState)
@@ -23215,7 +23394,7 @@ interface MediaSource extends EventTarget {
   setLiveSeekableRange(start: number, end: number): void;
   addEventListener<K extends keyof MediaSourceEventMap>(
     type: K,
-    listener: (this: MediaSource, ev: MediaSourceEventMap[K]) => any,
+    listener: (this: MediaSource, ev: MediaSourceEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -23225,7 +23404,7 @@ interface MediaSource extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MediaSourceEventMap>(
     type: K,
-    listener: (this: MediaSource, ev: MediaSourceEventMap[K]) => any,
+    listener: (this: MediaSource, ev: MediaSourceEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -23235,7 +23414,7 @@ interface MediaSource extends EventTarget {
   ): void;
 }
 
-declare var MediaSource: {
+declare const MediaSource: {
   prototype: MediaSource;
   new (): MediaSource;
   /**
@@ -23268,12 +23447,16 @@ interface MediaStream extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStream/addtrack_event)
    */
-  onaddtrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null;
+  onaddtrack:
+    | ((this: MediaStream, ev: MediaStreamTrackEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStream/removetrack_event)
    */
-  onremovetrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null;
+  onremovetrack:
+    | ((this: MediaStream, ev: MediaStreamTrackEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStream/addTrack)
@@ -23288,7 +23471,7 @@ interface MediaStream extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStream/getAudioTracks)
    */
-  getAudioTracks(): MediaStreamTrack[];
+  getAudioTracks(): readonly MediaStreamTrack[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStream/getTrackById)
@@ -23298,12 +23481,12 @@ interface MediaStream extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStream/getTracks)
    */
-  getTracks(): MediaStreamTrack[];
+  getTracks(): readonly MediaStreamTrack[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStream/getVideoTracks)
    */
-  getVideoTracks(): MediaStreamTrack[];
+  getVideoTracks(): readonly MediaStreamTrack[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStream/removeTrack)
@@ -23311,7 +23494,7 @@ interface MediaStream extends EventTarget {
   removeTrack(track: MediaStreamTrack): void;
   addEventListener<K extends keyof MediaStreamEventMap>(
     type: K,
-    listener: (this: MediaStream, ev: MediaStreamEventMap[K]) => any,
+    listener: (this: MediaStream, ev: MediaStreamEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -23321,7 +23504,7 @@ interface MediaStream extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MediaStreamEventMap>(
     type: K,
-    listener: (this: MediaStream, ev: MediaStreamEventMap[K]) => any,
+    listener: (this: MediaStream, ev: MediaStreamEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -23331,11 +23514,11 @@ interface MediaStream extends EventTarget {
   ): void;
 }
 
-declare var MediaStream: {
+declare const MediaStream: {
   prototype: MediaStream;
   new (): MediaStream;
   new (stream: MediaStream): MediaStream;
-  new (tracks: MediaStreamTrack[]): MediaStream;
+  new (tracks: readonly MediaStreamTrack[]): MediaStream;
 };
 
 /**
@@ -23350,7 +23533,7 @@ interface MediaStreamAudioDestinationNode extends AudioNode {
   readonly stream: MediaStream;
 }
 
-declare var MediaStreamAudioDestinationNode: {
+declare const MediaStreamAudioDestinationNode: {
   prototype: MediaStreamAudioDestinationNode;
   new (
     context: AudioContext,
@@ -23374,7 +23557,7 @@ interface MediaStreamAudioSourceNode extends AudioNode {
   readonly mediaStream: MediaStream;
 }
 
-declare var MediaStreamAudioSourceNode: {
+declare const MediaStreamAudioSourceNode: {
   prototype: MediaStreamAudioSourceNode;
   new (
     context: AudioContext,
@@ -23429,17 +23612,17 @@ interface MediaStreamTrack extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStreamTrack/ended_event)
    */
-  onended: ((this: MediaStreamTrack, ev: Event) => any) | null;
+  onended: ((this: MediaStreamTrack, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStreamTrack/mute_event)
    */
-  onmute: ((this: MediaStreamTrack, ev: Event) => any) | null;
+  onmute: ((this: MediaStreamTrack, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStreamTrack/unmute_event)
    */
-  onunmute: ((this: MediaStreamTrack, ev: Event) => any) | null;
+  onunmute: ((this: MediaStreamTrack, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MediaStreamTrack/readyState)
@@ -23477,7 +23660,10 @@ interface MediaStreamTrack extends EventTarget {
   stop(): void;
   addEventListener<K extends keyof MediaStreamTrackEventMap>(
     type: K,
-    listener: (this: MediaStreamTrack, ev: MediaStreamTrackEventMap[K]) => any,
+    listener: (
+      this: MediaStreamTrack,
+      ev: MediaStreamTrackEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -23487,7 +23673,10 @@ interface MediaStreamTrack extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MediaStreamTrackEventMap>(
     type: K,
-    listener: (this: MediaStreamTrack, ev: MediaStreamTrackEventMap[K]) => any,
+    listener: (
+      this: MediaStreamTrack,
+      ev: MediaStreamTrackEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -23497,7 +23686,7 @@ interface MediaStreamTrack extends EventTarget {
   ): void;
 }
 
-declare var MediaStreamTrack: {
+declare const MediaStreamTrack: {
   prototype: MediaStreamTrack;
   new (): MediaStreamTrack;
 };
@@ -23518,7 +23707,7 @@ interface MediaStreamTrackEvent extends Event {
   readonly track: MediaStreamTrack;
 }
 
-declare var MediaStreamTrackEvent: {
+declare const MediaStreamTrackEvent: {
   prototype: MediaStreamTrackEvent;
   new (
     type: string,
@@ -23549,7 +23738,7 @@ interface MessageChannel {
   readonly port2: MessagePort;
 }
 
-declare var MessageChannel: {
+declare const MessageChannel: {
   prototype: MessageChannel;
   new (): MessageChannel;
 };
@@ -23559,7 +23748,7 @@ declare var MessageChannel: {
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent)
  */
-interface MessageEvent<T = any> extends Event {
+interface MessageEvent<T = unknown> extends Event {
   /**
    * Returns the data of the message.
    *
@@ -23609,15 +23798,15 @@ interface MessageEvent<T = any> extends Event {
     type: string,
     bubbles?: boolean,
     cancelable?: boolean,
-    data?: any,
+    data?: unknown,
     origin?: string,
     lastEventId?: string,
     source?: MessageEventSource | null,
-    ports?: MessagePort[],
+    ports?: readonly MessagePort[],
   ): void;
 }
 
-declare var MessageEvent: {
+declare const MessageEvent: {
   prototype: MessageEvent;
   new <T>(type: string, eventInitDict?: MessageEventInit<T>): MessageEvent<T>;
 };
@@ -23639,12 +23828,12 @@ interface MessagePort extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MessagePort/message_event)
    */
-  onmessage: ((this: MessagePort, ev: MessageEvent) => any) | null;
+  onmessage: ((this: MessagePort, ev: MessageEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MessagePort/messageerror_event)
    */
-  onmessageerror: ((this: MessagePort, ev: MessageEvent) => any) | null;
+  onmessageerror: ((this: MessagePort, ev: MessageEvent) => unknown) | null;
   /**
    * Disconnects the port, so that it is no longer active.
    *
@@ -23663,8 +23852,8 @@ interface MessagePort extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MessagePort/postMessage)
    */
-  postMessage(message: any, transfer: Transferable[]): void;
-  postMessage(message: any, options?: StructuredSerializeOptions): void;
+  postMessage(message: unknown, transfer: readonly Transferable[]): void;
+  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
   /**
    * Begins dispatching messages received on the port.
    *
@@ -23674,7 +23863,7 @@ interface MessagePort extends EventTarget {
   start(): void;
   addEventListener<K extends keyof MessagePortEventMap>(
     type: K,
-    listener: (this: MessagePort, ev: MessagePortEventMap[K]) => any,
+    listener: (this: MessagePort, ev: MessagePortEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -23684,7 +23873,7 @@ interface MessagePort extends EventTarget {
   ): void;
   removeEventListener<K extends keyof MessagePortEventMap>(
     type: K,
-    listener: (this: MessagePort, ev: MessagePortEventMap[K]) => any,
+    listener: (this: MessagePort, ev: MessagePortEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -23694,7 +23883,7 @@ interface MessagePort extends EventTarget {
   ): void;
 }
 
-declare var MessagePort: {
+declare const MessagePort: {
   prototype: MessagePort;
   new (): MessagePort;
 };
@@ -23746,7 +23935,7 @@ interface MimeType {
 }
 
 /** @deprecated */
-declare var MimeType: {
+declare const MimeType: {
   prototype: MimeType;
   new (): MimeType;
 };
@@ -23786,7 +23975,7 @@ interface MimeTypeArray {
 }
 
 /** @deprecated */
-declare var MimeTypeArray: {
+declare const MimeTypeArray: {
   prototype: MimeTypeArray;
   new (): MimeTypeArray;
 };
@@ -23928,7 +24117,7 @@ interface MouseEvent extends UIEvent {
   ): void;
 }
 
-declare var MouseEvent: {
+declare const MouseEvent: {
   prototype: MouseEvent;
   new (type: string, eventInitDict?: MouseEventInit): MouseEvent;
 };
@@ -24003,7 +24192,7 @@ interface MutationEvent extends Event {
 }
 
 /** @deprecated */
-declare var MutationEvent: {
+declare const MutationEvent: {
   prototype: MutationEvent;
   new (): MutationEvent;
   readonly MODIFICATION: 1;
@@ -24044,10 +24233,10 @@ interface MutationObserver {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/MutationObserver/takeRecords)
    */
-  takeRecords(): MutationRecord[];
+  takeRecords(): readonly MutationRecord[];
 }
 
-declare var MutationObserver: {
+declare const MutationObserver: {
   prototype: MutationObserver;
   new (callback: MutationCallback): MutationObserver;
 };
@@ -24133,7 +24322,7 @@ interface MutationRecord {
   readonly type: MutationRecordType;
 }
 
-declare var MutationRecord: {
+declare const MutationRecord: {
   prototype: MutationRecord;
   new (): MutationRecord;
 };
@@ -24189,7 +24378,7 @@ interface NamedNodeMap {
   [index: number]: Attr;
 }
 
-declare var NamedNodeMap: {
+declare const NamedNodeMap: {
   prototype: NamedNodeMap;
   new (): NamedNodeMap;
 };
@@ -24223,7 +24412,7 @@ interface NavigationPreloadManager {
   setHeaderValue(value: string): Promise<void>;
 }
 
-declare var NavigationPreloadManager: {
+declare const NavigationPreloadManager: {
   prototype: NavigationPreloadManager;
   new (): NavigationPreloadManager;
 };
@@ -24337,7 +24526,7 @@ interface Navigator
    */
   requestMediaKeySystemAccess(
     keySystem: string,
-    supportedConfigurations: MediaKeySystemConfiguration[],
+    supportedConfigurations: readonly MediaKeySystemConfiguration[],
   ): Promise<MediaKeySystemAccess>;
   /**
    * [MDN
@@ -24357,7 +24546,7 @@ interface Navigator
   vibrate(pattern: VibratePattern): boolean;
 }
 
-declare var Navigator: {
+declare const Navigator: {
   prototype: Navigator;
   new (): Navigator;
 };
@@ -24750,7 +24939,7 @@ interface Node extends EventTarget {
   readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 0x20;
 }
 
-declare var Node: {
+declare const Node: {
   prototype: Node;
   new (): Node;
   /** Node is an element. */
@@ -24837,7 +25026,7 @@ interface NodeIterator {
   previousNode(): Node | null;
 }
 
-declare var NodeIterator: {
+declare const NodeIterator: {
   prototype: NodeIterator;
   new (): NodeIterator;
 };
@@ -24873,12 +25062,12 @@ interface NodeList {
    */
   forEach(
     callbackfn: (value: Node, key: number, parent: NodeList) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
   [index: number]: Node;
 }
 
-declare var NodeList: {
+declare const NodeList: {
   prototype: NodeList;
   new (): NodeList;
 };
@@ -24896,7 +25085,7 @@ interface NodeListOf<TNode extends Node> extends NodeList {
    */
   forEach(
     callbackfn: (value: TNode, key: number, parent: NodeListOf<TNode>) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
   [index: number]: TNode;
 }
@@ -24956,7 +25145,7 @@ interface Notification extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Notification/data)
    */
-  readonly data: any;
+  readonly data: unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Notification/dir)
@@ -24976,22 +25165,22 @@ interface Notification extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Notification/click_event)
    */
-  onclick: ((this: Notification, ev: Event) => any) | null;
+  onclick: ((this: Notification, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Notification/close_event)
    */
-  onclose: ((this: Notification, ev: Event) => any) | null;
+  onclose: ((this: Notification, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Notification/error_event)
    */
-  onerror: ((this: Notification, ev: Event) => any) | null;
+  onerror: ((this: Notification, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Notification/show_event)
    */
-  onshow: ((this: Notification, ev: Event) => any) | null;
+  onshow: ((this: Notification, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Notification/requireInteraction)
@@ -25019,7 +25208,7 @@ interface Notification extends EventTarget {
   close(): void;
   addEventListener<K extends keyof NotificationEventMap>(
     type: K,
-    listener: (this: Notification, ev: NotificationEventMap[K]) => any,
+    listener: (this: Notification, ev: NotificationEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -25029,7 +25218,7 @@ interface Notification extends EventTarget {
   ): void;
   removeEventListener<K extends keyof NotificationEventMap>(
     type: K,
-    listener: (this: Notification, ev: NotificationEventMap[K]) => any,
+    listener: (this: Notification, ev: NotificationEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -25039,7 +25228,7 @@ interface Notification extends EventTarget {
   ): void;
 }
 
-declare var Notification: {
+declare const Notification: {
   prototype: Notification;
   new (title: string, options?: NotificationOptions): Notification;
   /**
@@ -25242,7 +25431,7 @@ interface OfflineAudioCompletionEvent extends Event {
   readonly renderedBuffer: AudioBuffer;
 }
 
-declare var OfflineAudioCompletionEvent: {
+declare const OfflineAudioCompletionEvent: {
   prototype: OfflineAudioCompletionEvent;
   new (
     type: string,
@@ -25275,7 +25464,7 @@ interface OfflineAudioContext extends BaseAudioContext {
    * Reference](https://developer.mozilla.org/docs/Web/API/OfflineAudioContext/complete_event)
    */
   oncomplete:
-    | ((this: OfflineAudioContext, ev: OfflineAudioCompletionEvent) => any)
+    | ((this: OfflineAudioContext, ev: OfflineAudioCompletionEvent) => unknown)
     | null;
   /**
    * [MDN
@@ -25297,7 +25486,7 @@ interface OfflineAudioContext extends BaseAudioContext {
     listener: (
       this: OfflineAudioContext,
       ev: OfflineAudioContextEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -25310,7 +25499,7 @@ interface OfflineAudioContext extends BaseAudioContext {
     listener: (
       this: OfflineAudioContext,
       ev: OfflineAudioContextEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -25320,7 +25509,7 @@ interface OfflineAudioContext extends BaseAudioContext {
   ): void;
 }
 
-declare var OfflineAudioContext: {
+declare const OfflineAudioContext: {
   prototype: OfflineAudioContext;
   new (contextOptions: OfflineAudioContextOptions): OfflineAudioContext;
   new (
@@ -25348,8 +25537,8 @@ interface OffscreenCanvas extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/OffscreenCanvas/height)
    */
   height: number;
-  oncontextlost: ((this: OffscreenCanvas, ev: Event) => any) | null;
-  oncontextrestored: ((this: OffscreenCanvas, ev: Event) => any) | null;
+  oncontextlost: ((this: OffscreenCanvas, ev: Event) => unknown) | null;
+  oncontextrestored: ((this: OffscreenCanvas, ev: Event) => unknown) | null;
   /**
    * These attributes return the dimensions of the OffscreenCanvas object's
    * bitmap.
@@ -25395,17 +25584,23 @@ interface OffscreenCanvas extends EventTarget {
    */
   getContext(
     contextId: '2d',
-    options?: any,
+    options?: unknown,
   ): OffscreenCanvasRenderingContext2D | null;
   getContext(
     contextId: 'bitmaprenderer',
-    options?: any,
+    options?: unknown,
   ): ImageBitmapRenderingContext | null;
-  getContext(contextId: 'webgl', options?: any): WebGLRenderingContext | null;
-  getContext(contextId: 'webgl2', options?: any): WebGL2RenderingContext | null;
+  getContext(
+    contextId: 'webgl',
+    options?: unknown,
+  ): WebGLRenderingContext | null;
+  getContext(
+    contextId: 'webgl2',
+    options?: unknown,
+  ): WebGL2RenderingContext | null;
   getContext(
     contextId: OffscreenRenderingContextId,
-    options?: any,
+    options?: unknown,
   ): OffscreenRenderingContext | null;
   /**
    * Returns a newly created ImageBitmap object with the image in the
@@ -25418,7 +25613,10 @@ interface OffscreenCanvas extends EventTarget {
   transferToImageBitmap(): ImageBitmap;
   addEventListener<K extends keyof OffscreenCanvasEventMap>(
     type: K,
-    listener: (this: OffscreenCanvas, ev: OffscreenCanvasEventMap[K]) => any,
+    listener: (
+      this: OffscreenCanvas,
+      ev: OffscreenCanvasEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -25428,7 +25626,10 @@ interface OffscreenCanvas extends EventTarget {
   ): void;
   removeEventListener<K extends keyof OffscreenCanvasEventMap>(
     type: K,
-    listener: (this: OffscreenCanvas, ev: OffscreenCanvasEventMap[K]) => any,
+    listener: (
+      this: OffscreenCanvas,
+      ev: OffscreenCanvasEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -25438,7 +25639,7 @@ interface OffscreenCanvas extends EventTarget {
   ): void;
 }
 
-declare var OffscreenCanvas: {
+declare const OffscreenCanvas: {
   prototype: OffscreenCanvas;
   new (width: number, height: number): OffscreenCanvas;
 };
@@ -25471,7 +25672,7 @@ interface OffscreenCanvasRenderingContext2D
   commit(): void;
 }
 
-declare var OffscreenCanvasRenderingContext2D: {
+declare const OffscreenCanvasRenderingContext2D: {
   prototype: OffscreenCanvasRenderingContext2D;
   new (): OffscreenCanvasRenderingContext2D;
 };
@@ -25510,7 +25711,7 @@ interface OscillatorNode extends AudioScheduledSourceNode {
     listener: (
       this: OscillatorNode,
       ev: AudioScheduledSourceNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -25523,7 +25724,7 @@ interface OscillatorNode extends AudioScheduledSourceNode {
     listener: (
       this: OscillatorNode,
       ev: AudioScheduledSourceNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -25533,7 +25734,7 @@ interface OscillatorNode extends AudioScheduledSourceNode {
   ): void;
 }
 
-declare var OscillatorNode: {
+declare const OscillatorNode: {
   prototype: OscillatorNode;
   new (context: BaseAudioContext, options?: OscillatorOptions): OscillatorNode;
 };
@@ -25550,7 +25751,7 @@ interface OverconstrainedError extends DOMException {
   readonly constraint: string;
 }
 
-declare var OverconstrainedError: {
+declare const OverconstrainedError: {
   prototype: OverconstrainedError;
   new (constraint: string, message?: string): OverconstrainedError;
 };
@@ -25583,7 +25784,7 @@ interface PageTransitionEvent extends Event {
   readonly persisted: boolean;
 }
 
-declare var PageTransitionEvent: {
+declare const PageTransitionEvent: {
   prototype: PageTransitionEvent;
   new (
     type: string,
@@ -25685,7 +25886,7 @@ interface PannerNode extends AudioNode {
   setPosition(x: number, y: number, z: number): void;
 }
 
-declare var PannerNode: {
+declare const PannerNode: {
   prototype: PannerNode;
   new (context: BaseAudioContext, options?: PannerOptions): PannerNode;
 };
@@ -25812,7 +26013,7 @@ interface Path2D extends CanvasPath {
   addPath(path: Path2D, transform?: DOMMatrix2DInit): void;
 }
 
-declare var Path2D: {
+declare const Path2D: {
   prototype: Path2D;
   new (path?: Path2D | string): Path2D;
 };
@@ -25828,7 +26029,7 @@ interface PaymentMethodChangeEvent extends PaymentRequestUpdateEvent {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PaymentMethodChangeEvent/methodDetails)
    */
-  readonly methodDetails: any;
+  readonly methodDetails: unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PaymentMethodChangeEvent/methodName)
@@ -25836,7 +26037,7 @@ interface PaymentMethodChangeEvent extends PaymentRequestUpdateEvent {
   readonly methodName: string;
 }
 
-declare var PaymentMethodChangeEvent: {
+declare const PaymentMethodChangeEvent: {
   prototype: PaymentMethodChangeEvent;
   new (
     type: string,
@@ -25865,7 +26066,7 @@ interface PaymentRequest extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PaymentRequest/paymentmethodchange_event)
    */
-  onpaymentmethodchange: ((this: PaymentRequest, ev: Event) => any) | null;
+  onpaymentmethodchange: ((this: PaymentRequest, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PaymentRequest/abort)
@@ -25885,7 +26086,7 @@ interface PaymentRequest extends EventTarget {
   ): Promise<PaymentResponse>;
   addEventListener<K extends keyof PaymentRequestEventMap>(
     type: K,
-    listener: (this: PaymentRequest, ev: PaymentRequestEventMap[K]) => any,
+    listener: (this: PaymentRequest, ev: PaymentRequestEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -25895,7 +26096,7 @@ interface PaymentRequest extends EventTarget {
   ): void;
   removeEventListener<K extends keyof PaymentRequestEventMap>(
     type: K,
-    listener: (this: PaymentRequest, ev: PaymentRequestEventMap[K]) => any,
+    listener: (this: PaymentRequest, ev: PaymentRequestEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -25905,10 +26106,10 @@ interface PaymentRequest extends EventTarget {
   ): void;
 }
 
-declare var PaymentRequest: {
+declare const PaymentRequest: {
   prototype: PaymentRequest;
   new (
-    methodData: PaymentMethodData[],
+    methodData: readonly PaymentMethodData[],
     details: PaymentDetailsInit,
   ): PaymentRequest;
 };
@@ -25931,7 +26132,7 @@ interface PaymentRequestUpdateEvent extends Event {
   ): void;
 }
 
-declare var PaymentRequestUpdateEvent: {
+declare const PaymentRequestUpdateEvent: {
   prototype: PaymentRequestUpdateEvent;
   new (
     type: string,
@@ -25950,7 +26151,7 @@ interface PaymentResponse extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PaymentResponse/details)
    */
-  readonly details: any;
+  readonly details: unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PaymentResponse/methodName)
@@ -25975,10 +26176,10 @@ interface PaymentResponse extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PaymentResponse/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var PaymentResponse: {
+declare const PaymentResponse: {
   prototype: PaymentResponse;
   new (): PaymentResponse;
 };
@@ -26012,7 +26213,9 @@ interface Performance extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Performance/resourcetimingbufferfull_event)
    */
-  onresourcetimingbufferfull: ((this: Performance, ev: Event) => any) | null;
+  onresourcetimingbufferfull:
+    | ((this: Performance, ev: Event) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Performance/timeOrigin)
@@ -26080,10 +26283,10 @@ interface Performance extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Performance/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
   addEventListener<K extends keyof PerformanceEventMap>(
     type: K,
-    listener: (this: Performance, ev: PerformanceEventMap[K]) => any,
+    listener: (this: Performance, ev: PerformanceEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -26093,7 +26296,7 @@ interface Performance extends EventTarget {
   ): void;
   removeEventListener<K extends keyof PerformanceEventMap>(
     type: K,
-    listener: (this: Performance, ev: PerformanceEventMap[K]) => any,
+    listener: (this: Performance, ev: PerformanceEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -26103,7 +26306,7 @@ interface Performance extends EventTarget {
   ): void;
 }
 
-declare var Performance: {
+declare const Performance: {
   prototype: Performance;
   new (): Performance;
 };
@@ -26142,10 +26345,10 @@ interface PerformanceEntry {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PerformanceEntry/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var PerformanceEntry: {
+declare const PerformanceEntry: {
   prototype: PerformanceEntry;
   new (): PerformanceEntry;
 };
@@ -26179,10 +26382,10 @@ interface PerformanceEventTiming extends PerformanceEntry {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PerformanceEventTiming/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var PerformanceEventTiming: {
+declare const PerformanceEventTiming: {
   prototype: PerformanceEventTiming;
   new (): PerformanceEventTiming;
 };
@@ -26200,10 +26403,10 @@ interface PerformanceMark extends PerformanceEntry {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PerformanceMark/detail)
    */
-  readonly detail: any;
+  readonly detail: unknown;
 }
 
-declare var PerformanceMark: {
+declare const PerformanceMark: {
   prototype: PerformanceMark;
   new (markName: string, markOptions?: PerformanceMarkOptions): PerformanceMark;
 };
@@ -26222,10 +26425,10 @@ interface PerformanceMeasure extends PerformanceEntry {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PerformanceMeasure/detail)
    */
-  readonly detail: any;
+  readonly detail: unknown;
 }
 
-declare var PerformanceMeasure: {
+declare const PerformanceMeasure: {
   prototype: PerformanceMeasure;
   new (): PerformanceMeasure;
 };
@@ -26262,7 +26465,7 @@ interface PerformanceNavigation {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/PerformanceNavigation/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
   readonly TYPE_NAVIGATE: 0;
   readonly TYPE_RELOAD: 1;
   readonly TYPE_BACK_FORWARD: 2;
@@ -26270,7 +26473,7 @@ interface PerformanceNavigation {
 }
 
 /** @deprecated */
-declare var PerformanceNavigation: {
+declare const PerformanceNavigation: {
   prototype: PerformanceNavigation;
   new (): PerformanceNavigation;
   readonly TYPE_NAVIGATE: 0;
@@ -26342,10 +26545,10 @@ interface PerformanceNavigationTiming extends PerformanceResourceTiming {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PerformanceNavigationTiming/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var PerformanceNavigationTiming: {
+declare const PerformanceNavigationTiming: {
   prototype: PerformanceNavigationTiming;
   new (): PerformanceNavigationTiming;
 };
@@ -26372,7 +26575,7 @@ interface PerformanceObserver {
   takeRecords(): PerformanceEntryList;
 }
 
-declare var PerformanceObserver: {
+declare const PerformanceObserver: {
   prototype: PerformanceObserver;
   new (callback: PerformanceObserverCallback): PerformanceObserver;
   /**
@@ -26404,7 +26607,7 @@ interface PerformanceObserverEntryList {
   getEntriesByType(type: string): PerformanceEntryList;
 }
 
-declare var PerformanceObserverEntryList: {
+declare const PerformanceObserverEntryList: {
   prototype: PerformanceObserverEntryList;
   new (): PerformanceObserverEntryList;
 };
@@ -26415,7 +26618,7 @@ declare var PerformanceObserverEntryList: {
  */
 interface PerformancePaintTiming extends PerformanceEntry {}
 
-declare var PerformancePaintTiming: {
+declare const PerformancePaintTiming: {
   prototype: PerformancePaintTiming;
   new (): PerformancePaintTiming;
 };
@@ -26524,10 +26727,10 @@ interface PerformanceResourceTiming extends PerformanceEntry {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PerformanceResourceTiming/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var PerformanceResourceTiming: {
+declare const PerformanceResourceTiming: {
   prototype: PerformanceResourceTiming;
   new (): PerformanceResourceTiming;
 };
@@ -26556,10 +26759,10 @@ interface PerformanceServerTiming {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PerformanceServerTiming/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var PerformanceServerTiming: {
+declare const PerformanceServerTiming: {
   prototype: PerformanceServerTiming;
   new (): PerformanceServerTiming;
 };
@@ -26730,11 +26933,11 @@ interface PerformanceTiming {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/PerformanceTiming/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
 /** @deprecated */
-declare var PerformanceTiming: {
+declare const PerformanceTiming: {
   prototype: PerformanceTiming;
   new (): PerformanceTiming;
 };
@@ -26748,7 +26951,7 @@ declare var PerformanceTiming: {
  */
 interface PeriodicWave {}
 
-declare var PeriodicWave: {
+declare const PeriodicWave: {
   prototype: PeriodicWave;
   new (context: BaseAudioContext, options?: PeriodicWaveOptions): PeriodicWave;
 };
@@ -26768,7 +26971,7 @@ interface PermissionStatus extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PermissionStatus/change_event)
    */
-  onchange: ((this: PermissionStatus, ev: Event) => any) | null;
+  onchange: ((this: PermissionStatus, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PermissionStatus/state)
@@ -26776,7 +26979,10 @@ interface PermissionStatus extends EventTarget {
   readonly state: PermissionState;
   addEventListener<K extends keyof PermissionStatusEventMap>(
     type: K,
-    listener: (this: PermissionStatus, ev: PermissionStatusEventMap[K]) => any,
+    listener: (
+      this: PermissionStatus,
+      ev: PermissionStatusEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -26786,7 +26992,10 @@ interface PermissionStatus extends EventTarget {
   ): void;
   removeEventListener<K extends keyof PermissionStatusEventMap>(
     type: K,
-    listener: (this: PermissionStatus, ev: PermissionStatusEventMap[K]) => any,
+    listener: (
+      this: PermissionStatus,
+      ev: PermissionStatusEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -26796,7 +27005,7 @@ interface PermissionStatus extends EventTarget {
   ): void;
 }
 
-declare var PermissionStatus: {
+declare const PermissionStatus: {
   prototype: PermissionStatus;
   new (): PermissionStatus;
 };
@@ -26810,7 +27019,7 @@ interface Permissions {
   query(permissionDesc: PermissionDescriptor): Promise<PermissionStatus>;
 }
 
-declare var Permissions: {
+declare const Permissions: {
   prototype: Permissions;
   new (): Permissions;
 };
@@ -26827,7 +27036,7 @@ interface PictureInPictureEvent extends Event {
   readonly pictureInPictureWindow: PictureInPictureWindow;
 }
 
-declare var PictureInPictureEvent: {
+declare const PictureInPictureEvent: {
   prototype: PictureInPictureEvent;
   new (
     type: string,
@@ -26853,7 +27062,7 @@ interface PictureInPictureWindow extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PictureInPictureWindow/resize_event)
    */
-  onresize: ((this: PictureInPictureWindow, ev: Event) => any) | null;
+  onresize: ((this: PictureInPictureWindow, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PictureInPictureWindow/width)
@@ -26864,7 +27073,7 @@ interface PictureInPictureWindow extends EventTarget {
     listener: (
       this: PictureInPictureWindow,
       ev: PictureInPictureWindowEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -26877,7 +27086,7 @@ interface PictureInPictureWindow extends EventTarget {
     listener: (
       this: PictureInPictureWindow,
       ev: PictureInPictureWindowEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -26887,7 +27096,7 @@ interface PictureInPictureWindow extends EventTarget {
   ): void;
 }
 
-declare var PictureInPictureWindow: {
+declare const PictureInPictureWindow: {
   prototype: PictureInPictureWindow;
   new (): PictureInPictureWindow;
 };
@@ -26952,7 +27161,7 @@ interface Plugin {
 }
 
 /** @deprecated */
-declare var Plugin: {
+declare const Plugin: {
   prototype: Plugin;
   new (): Plugin;
 };
@@ -27001,7 +27210,7 @@ interface PluginArray {
 }
 
 /** @deprecated */
-declare var PluginArray: {
+declare const PluginArray: {
   prototype: PluginArray;
   new (): PluginArray;
 };
@@ -27070,15 +27279,15 @@ interface PointerEvent extends MouseEvent {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PointerEvent/getCoalescedEvents)
    */
-  getCoalescedEvents(): PointerEvent[];
+  getCoalescedEvents(): readonly PointerEvent[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PointerEvent/getPredictedEvents)
    */
-  getPredictedEvents(): PointerEvent[];
+  getPredictedEvents(): readonly PointerEvent[];
 }
 
-declare var PointerEvent: {
+declare const PointerEvent: {
   prototype: PointerEvent;
   new (type: string, eventInitDict?: PointerEventInit): PointerEvent;
 };
@@ -27096,10 +27305,10 @@ interface PopStateEvent extends Event {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PopStateEvent/state)
    */
-  readonly state: any;
+  readonly state: unknown;
 }
 
-declare var PopStateEvent: {
+declare const PopStateEvent: {
   prototype: PopStateEvent;
   new (type: string, eventInitDict?: PopStateEventInit): PopStateEvent;
 };
@@ -27133,7 +27342,7 @@ interface ProcessingInstruction extends CharacterData, LinkStyle {
   readonly target: string;
 }
 
-declare var ProcessingInstruction: {
+declare const ProcessingInstruction: {
   prototype: ProcessingInstruction;
   new (): ProcessingInstruction;
 };
@@ -27164,7 +27373,7 @@ interface ProgressEvent<T extends EventTarget = EventTarget> extends Event {
   readonly total: number;
 }
 
-declare var ProgressEvent: {
+declare const ProgressEvent: {
   prototype: ProgressEvent;
   new (type: string, eventInitDict?: ProgressEventInit): ProgressEvent;
 };
@@ -27178,15 +27387,15 @@ interface PromiseRejectionEvent extends Event {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PromiseRejectionEvent/promise)
    */
-  readonly promise: Promise<any>;
+  readonly promise: Promise<unknown>;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/PromiseRejectionEvent/reason)
    */
-  readonly reason: any;
+  readonly reason: unknown;
 }
 
-declare var PromiseRejectionEvent: {
+declare const PromiseRejectionEvent: {
   prototype: PromiseRejectionEvent;
   new (
     type: string,
@@ -27219,7 +27428,7 @@ interface PublicKeyCredential extends Credential {
   getClientExtensionResults(): AuthenticationExtensionsClientOutputs;
 }
 
-declare var PublicKeyCredential: {
+declare const PublicKeyCredential: {
   prototype: PublicKeyCredential;
   new (): PublicKeyCredential;
   /**
@@ -27261,7 +27470,7 @@ interface PushManager {
   subscribe(options?: PushSubscriptionOptionsInit): Promise<PushSubscription>;
 }
 
-declare var PushManager: {
+declare const PushManager: {
   prototype: PushManager;
   new (): PushManager;
   /**
@@ -27310,7 +27519,7 @@ interface PushSubscription {
   unsubscribe(): Promise<boolean>;
 }
 
-declare var PushSubscription: {
+declare const PushSubscription: {
   prototype: PushSubscription;
   new (): PushSubscription;
 };
@@ -27334,7 +27543,7 @@ interface PushSubscriptionOptions {
   readonly userVisibleOnly: boolean;
 }
 
-declare var PushSubscriptionOptions: {
+declare const PushSubscriptionOptions: {
   prototype: PushSubscriptionOptions;
   new (): PushSubscriptionOptions;
 };
@@ -27350,10 +27559,10 @@ interface RTCCertificate {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCCertificate/getFingerprints)
    */
-  getFingerprints(): RTCDtlsFingerprint[];
+  getFingerprints(): readonly RTCDtlsFingerprint[];
 }
 
-declare var RTCCertificate: {
+declare const RTCCertificate: {
   prototype: RTCCertificate;
   new (): RTCCertificate;
 };
@@ -27374,7 +27583,7 @@ interface RTCDTMFSender extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDTMFSender/tonechange_event)
    */
   ontonechange:
-    | ((this: RTCDTMFSender, ev: RTCDTMFToneChangeEvent) => any)
+    | ((this: RTCDTMFSender, ev: RTCDTMFToneChangeEvent) => unknown)
     | null;
   /**
    * [MDN
@@ -27388,7 +27597,7 @@ interface RTCDTMFSender extends EventTarget {
   insertDTMF(tones: string, duration?: number, interToneGap?: number): void;
   addEventListener<K extends keyof RTCDTMFSenderEventMap>(
     type: K,
-    listener: (this: RTCDTMFSender, ev: RTCDTMFSenderEventMap[K]) => any,
+    listener: (this: RTCDTMFSender, ev: RTCDTMFSenderEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -27398,7 +27607,7 @@ interface RTCDTMFSender extends EventTarget {
   ): void;
   removeEventListener<K extends keyof RTCDTMFSenderEventMap>(
     type: K,
-    listener: (this: RTCDTMFSender, ev: RTCDTMFSenderEventMap[K]) => any,
+    listener: (this: RTCDTMFSender, ev: RTCDTMFSenderEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -27408,7 +27617,7 @@ interface RTCDTMFSender extends EventTarget {
   ): void;
 }
 
-declare var RTCDTMFSender: {
+declare const RTCDTMFSender: {
   prototype: RTCDTMFSender;
   new (): RTCDTMFSender;
 };
@@ -27428,7 +27637,7 @@ interface RTCDTMFToneChangeEvent extends Event {
   readonly tone: string;
 }
 
-declare var RTCDTMFToneChangeEvent: {
+declare const RTCDTMFToneChangeEvent: {
   prototype: RTCDTMFToneChangeEvent;
   new (
     type: string,
@@ -27491,32 +27700,32 @@ interface RTCDataChannel extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDataChannel/bufferedamountlow_event)
    */
-  onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => any) | null;
+  onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDataChannel/close_event)
    */
-  onclose: ((this: RTCDataChannel, ev: Event) => any) | null;
+  onclose: ((this: RTCDataChannel, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDataChannel/closing_event)
    */
-  onclosing: ((this: RTCDataChannel, ev: Event) => any) | null;
+  onclosing: ((this: RTCDataChannel, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDataChannel/error_event)
    */
-  onerror: ((this: RTCDataChannel, ev: Event) => any) | null;
+  onerror: ((this: RTCDataChannel, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDataChannel/message_event)
    */
-  onmessage: ((this: RTCDataChannel, ev: MessageEvent) => any) | null;
+  onmessage: ((this: RTCDataChannel, ev: MessageEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDataChannel/open_event)
    */
-  onopen: ((this: RTCDataChannel, ev: Event) => any) | null;
+  onopen: ((this: RTCDataChannel, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDataChannel/ordered)
@@ -27547,7 +27756,7 @@ interface RTCDataChannel extends EventTarget {
   send(data: ArrayBufferView): void;
   addEventListener<K extends keyof RTCDataChannelEventMap>(
     type: K,
-    listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => any,
+    listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -27557,7 +27766,7 @@ interface RTCDataChannel extends EventTarget {
   ): void;
   removeEventListener<K extends keyof RTCDataChannelEventMap>(
     type: K,
-    listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => any,
+    listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -27567,7 +27776,7 @@ interface RTCDataChannel extends EventTarget {
   ): void;
 }
 
-declare var RTCDataChannel: {
+declare const RTCDataChannel: {
   prototype: RTCDataChannel;
   new (): RTCDataChannel;
 };
@@ -27584,7 +27793,7 @@ interface RTCDataChannelEvent extends Event {
   readonly channel: RTCDataChannel;
 }
 
-declare var RTCDataChannelEvent: {
+declare const RTCDataChannelEvent: {
   prototype: RTCDataChannelEvent;
   new (
     type: string,
@@ -27604,12 +27813,12 @@ interface RTCDtlsTransport extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDtlsTransport/iceTransport)
    */
   readonly iceTransport: RTCIceTransport;
-  onerror: ((this: RTCDtlsTransport, ev: Event) => any) | null;
+  onerror: ((this: RTCDtlsTransport, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDtlsTransport/statechange_event)
    */
-  onstatechange: ((this: RTCDtlsTransport, ev: Event) => any) | null;
+  onstatechange: ((this: RTCDtlsTransport, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDtlsTransport/state)
@@ -27619,10 +27828,13 @@ interface RTCDtlsTransport extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCDtlsTransport/getRemoteCertificates)
    */
-  getRemoteCertificates(): ArrayBuffer[];
+  getRemoteCertificates(): readonly ArrayBuffer[];
   addEventListener<K extends keyof RTCDtlsTransportEventMap>(
     type: K,
-    listener: (this: RTCDtlsTransport, ev: RTCDtlsTransportEventMap[K]) => any,
+    listener: (
+      this: RTCDtlsTransport,
+      ev: RTCDtlsTransportEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -27632,7 +27844,10 @@ interface RTCDtlsTransport extends EventTarget {
   ): void;
   removeEventListener<K extends keyof RTCDtlsTransportEventMap>(
     type: K,
-    listener: (this: RTCDtlsTransport, ev: RTCDtlsTransportEventMap[K]) => any,
+    listener: (
+      this: RTCDtlsTransport,
+      ev: RTCDtlsTransportEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -27642,7 +27857,7 @@ interface RTCDtlsTransport extends EventTarget {
   ): void;
 }
 
-declare var RTCDtlsTransport: {
+declare const RTCDtlsTransport: {
   prototype: RTCDtlsTransport;
   new (): RTCDtlsTransport;
 };
@@ -27669,7 +27884,7 @@ interface RTCEncodedAudioFrame {
   getMetadata(): RTCEncodedAudioFrameMetadata;
 }
 
-declare var RTCEncodedAudioFrame: {
+declare const RTCEncodedAudioFrame: {
   prototype: RTCEncodedAudioFrame;
   new (): RTCEncodedAudioFrame;
 };
@@ -27701,7 +27916,7 @@ interface RTCEncodedVideoFrame {
   getMetadata(): RTCEncodedVideoFrameMetadata;
 }
 
-declare var RTCEncodedVideoFrame: {
+declare const RTCEncodedVideoFrame: {
   prototype: RTCEncodedVideoFrame;
   new (): RTCEncodedVideoFrame;
 };
@@ -27735,7 +27950,7 @@ interface RTCError extends DOMException {
   readonly sentAlert: number | null;
 }
 
-declare var RTCError: {
+declare const RTCError: {
   prototype: RTCError;
   new (init: RTCErrorInit, message?: string): RTCError;
 };
@@ -27749,7 +27964,7 @@ interface RTCErrorEvent extends Event {
   readonly error: RTCError;
 }
 
-declare var RTCErrorEvent: {
+declare const RTCErrorEvent: {
   prototype: RTCErrorEvent;
   new (type: string, eventInitDict: RTCErrorEventInit): RTCErrorEvent;
 };
@@ -27839,7 +28054,7 @@ interface RTCIceCandidate {
   toJSON(): RTCIceCandidateInit;
 }
 
-declare var RTCIceCandidate: {
+declare const RTCIceCandidate: {
   prototype: RTCIceCandidate;
   new (candidateInitDict?: RTCIceCandidateInit): RTCIceCandidate;
 };
@@ -27866,19 +28081,21 @@ interface RTCIceTransport extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCIceTransport/gatheringstatechange_event)
    */
-  ongatheringstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
+  ongatheringstatechange:
+    | ((this: RTCIceTransport, ev: Event) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCIceTransport/selectedcandidatepairchange_event)
    */
   onselectedcandidatepairchange:
-    | ((this: RTCIceTransport, ev: Event) => any)
+    | ((this: RTCIceTransport, ev: Event) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCIceTransport/statechange_event)
    */
-  onstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
+  onstatechange: ((this: RTCIceTransport, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCIceTransport/state)
@@ -27891,7 +28108,10 @@ interface RTCIceTransport extends EventTarget {
   getSelectedCandidatePair(): RTCIceCandidatePair | null;
   addEventListener<K extends keyof RTCIceTransportEventMap>(
     type: K,
-    listener: (this: RTCIceTransport, ev: RTCIceTransportEventMap[K]) => any,
+    listener: (
+      this: RTCIceTransport,
+      ev: RTCIceTransportEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -27901,7 +28121,10 @@ interface RTCIceTransport extends EventTarget {
   ): void;
   removeEventListener<K extends keyof RTCIceTransportEventMap>(
     type: K,
-    listener: (this: RTCIceTransport, ev: RTCIceTransportEventMap[K]) => any,
+    listener: (
+      this: RTCIceTransport,
+      ev: RTCIceTransportEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -27911,7 +28134,7 @@ interface RTCIceTransport extends EventTarget {
   ): void;
 }
 
-declare var RTCIceTransport: {
+declare const RTCIceTransport: {
   prototype: RTCIceTransport;
   new (): RTCIceTransport;
 };
@@ -27975,57 +28198,61 @@ interface RTCPeerConnection extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/connectionstatechange_event)
    */
-  onconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
+  onconnectionstatechange:
+    | ((this: RTCPeerConnection, ev: Event) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/datachannel_event)
    */
   ondatachannel:
-    | ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => any)
+    | ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/icecandidate_event)
    */
   onicecandidate:
-    | ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any)
+    | ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/icecandidateerror_event)
    */
   onicecandidateerror:
-    | ((this: RTCPeerConnection, ev: RTCPeerConnectionIceErrorEvent) => any)
+    | ((this: RTCPeerConnection, ev: RTCPeerConnectionIceErrorEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/iceconnectionstatechange_event)
    */
   oniceconnectionstatechange:
-    | ((this: RTCPeerConnection, ev: Event) => any)
+    | ((this: RTCPeerConnection, ev: Event) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/icegatheringstatechange_event)
    */
   onicegatheringstatechange:
-    | ((this: RTCPeerConnection, ev: Event) => any)
+    | ((this: RTCPeerConnection, ev: Event) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/negotiationneeded_event)
    */
-  onnegotiationneeded: ((this: RTCPeerConnection, ev: Event) => any) | null;
+  onnegotiationneeded: ((this: RTCPeerConnection, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/signalingstatechange_event)
    */
-  onsignalingstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
+  onsignalingstatechange:
+    | ((this: RTCPeerConnection, ev: Event) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/track_event)
    */
-  ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null;
+  ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/pendingLocalDescription)
@@ -28066,7 +28293,10 @@ interface RTCPeerConnection extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/addTrack)
    */
-  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender;
+  addTrack(
+    track: MediaStreamTrack,
+    ...streams: readonly MediaStream[]
+  ): RTCRtpSender;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/addTransceiver)
@@ -28118,12 +28348,12 @@ interface RTCPeerConnection extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/getReceivers)
    */
-  getReceivers(): RTCRtpReceiver[];
+  getReceivers(): readonly RTCRtpReceiver[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/getSenders)
    */
-  getSenders(): RTCRtpSender[];
+  getSenders(): readonly RTCRtpSender[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/getStats)
@@ -28133,7 +28363,7 @@ interface RTCPeerConnection extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/getTransceivers)
    */
-  getTransceivers(): RTCRtpTransceiver[];
+  getTransceivers(): readonly RTCRtpTransceiver[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCPeerConnection/removeTrack)
@@ -28178,7 +28408,7 @@ interface RTCPeerConnection extends EventTarget {
     listener: (
       this: RTCPeerConnection,
       ev: RTCPeerConnectionEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -28191,7 +28421,7 @@ interface RTCPeerConnection extends EventTarget {
     listener: (
       this: RTCPeerConnection,
       ev: RTCPeerConnectionEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -28201,7 +28431,7 @@ interface RTCPeerConnection extends EventTarget {
   ): void;
 }
 
-declare var RTCPeerConnection: {
+declare const RTCPeerConnection: {
   prototype: RTCPeerConnection;
   new (configuration?: RTCConfiguration): RTCPeerConnection;
   /**
@@ -28241,7 +28471,7 @@ interface RTCPeerConnectionIceErrorEvent extends Event {
   readonly url: string;
 }
 
-declare var RTCPeerConnectionIceErrorEvent: {
+declare const RTCPeerConnectionIceErrorEvent: {
   prototype: RTCPeerConnectionIceErrorEvent;
   new (
     type: string,
@@ -28264,7 +28494,7 @@ interface RTCPeerConnectionIceEvent extends Event {
   readonly candidate: RTCIceCandidate | null;
 }
 
-declare var RTCPeerConnectionIceEvent: {
+declare const RTCPeerConnectionIceEvent: {
   prototype: RTCPeerConnectionIceEvent;
   new (
     type: string,
@@ -28298,7 +28528,7 @@ interface RTCRtpReceiver {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCRtpReceiver/getContributingSources)
    */
-  getContributingSources(): RTCRtpContributingSource[];
+  getContributingSources(): readonly RTCRtpContributingSource[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCRtpReceiver/getParameters)
@@ -28313,10 +28543,10 @@ interface RTCRtpReceiver {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCRtpReceiver/getSynchronizationSources)
    */
-  getSynchronizationSources(): RTCRtpSynchronizationSource[];
+  getSynchronizationSources(): readonly RTCRtpSynchronizationSource[];
 }
 
-declare var RTCRtpReceiver: {
+declare const RTCRtpReceiver: {
   prototype: RTCRtpReceiver;
   new (): RTCRtpReceiver;
   /**
@@ -28332,9 +28562,13 @@ declare var RTCRtpReceiver: {
  */
 interface RTCRtpScriptTransform {}
 
-declare var RTCRtpScriptTransform: {
+declare const RTCRtpScriptTransform: {
   prototype: RTCRtpScriptTransform;
-  new (worker: Worker, options?: any, transfer?: any[]): RTCRtpScriptTransform;
+  new (
+    worker: Worker,
+    options?: unknown,
+    transfer?: readonly unknown[],
+  ): RTCRtpScriptTransform;
 };
 
 /**
@@ -28391,10 +28625,10 @@ interface RTCRtpSender {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCRtpSender/setStreams)
    */
-  setStreams(...streams: MediaStream[]): void;
+  setStreams(...streams: readonly MediaStream[]): void;
 }
 
-declare var RTCRtpSender: {
+declare const RTCRtpSender: {
   prototype: RTCRtpSender;
   new (): RTCRtpSender;
   /**
@@ -28435,7 +28669,7 @@ interface RTCRtpTransceiver {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCRtpTransceiver/setCodecPreferences)
    */
-  setCodecPreferences(codecs: RTCRtpCodecCapability[]): void;
+  setCodecPreferences(codecs: readonly RTCRtpCodecCapability[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCRtpTransceiver/stop)
@@ -28443,7 +28677,7 @@ interface RTCRtpTransceiver {
   stop(): void;
 }
 
-declare var RTCRtpTransceiver: {
+declare const RTCRtpTransceiver: {
   prototype: RTCRtpTransceiver;
   new (): RTCRtpTransceiver;
 };
@@ -28464,7 +28698,7 @@ interface RTCSctpTransport extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCSctpTransport/maxMessageSize)
    */
   readonly maxMessageSize: number;
-  onstatechange: ((this: RTCSctpTransport, ev: Event) => any) | null;
+  onstatechange: ((this: RTCSctpTransport, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCSctpTransport/state)
@@ -28477,7 +28711,10 @@ interface RTCSctpTransport extends EventTarget {
   readonly transport: RTCDtlsTransport;
   addEventListener<K extends keyof RTCSctpTransportEventMap>(
     type: K,
-    listener: (this: RTCSctpTransport, ev: RTCSctpTransportEventMap[K]) => any,
+    listener: (
+      this: RTCSctpTransport,
+      ev: RTCSctpTransportEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -28487,7 +28724,10 @@ interface RTCSctpTransport extends EventTarget {
   ): void;
   removeEventListener<K extends keyof RTCSctpTransportEventMap>(
     type: K,
-    listener: (this: RTCSctpTransport, ev: RTCSctpTransportEventMap[K]) => any,
+    listener: (
+      this: RTCSctpTransport,
+      ev: RTCSctpTransportEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -28497,7 +28737,7 @@ interface RTCSctpTransport extends EventTarget {
   ): void;
 }
 
-declare var RTCSctpTransport: {
+declare const RTCSctpTransport: {
   prototype: RTCSctpTransport;
   new (): RTCSctpTransport;
 };
@@ -28526,10 +28766,10 @@ interface RTCSessionDescription {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RTCSessionDescription/toJSON)
    */
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var RTCSessionDescription: {
+declare const RTCSessionDescription: {
   prototype: RTCSessionDescription;
   new (descriptionInitDict: RTCSessionDescriptionInit): RTCSessionDescription;
 };
@@ -28537,12 +28777,12 @@ declare var RTCSessionDescription: {
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/RTCStatsReport) */
 interface RTCStatsReport {
   forEach(
-    callbackfn: (value: any, key: string, parent: RTCStatsReport) => void,
-    thisArg?: any,
+    callbackfn: (value: unknown, key: string, parent: RTCStatsReport) => void,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var RTCStatsReport: {
+declare const RTCStatsReport: {
   prototype: RTCStatsReport;
   new (): RTCStatsReport;
 };
@@ -28571,7 +28811,7 @@ interface RTCTrackEvent extends Event {
   readonly transceiver: RTCRtpTransceiver;
 }
 
-declare var RTCTrackEvent: {
+declare const RTCTrackEvent: {
   prototype: RTCTrackEvent;
   new (type: string, eventInitDict: RTCTrackEventInit): RTCTrackEvent;
 };
@@ -28585,7 +28825,7 @@ interface RadioNodeList extends NodeList {
   value: string;
 }
 
-declare var RadioNodeList: {
+declare const RadioNodeList: {
   prototype: RadioNodeList;
   new (): RadioNodeList;
 };
@@ -28719,7 +28959,7 @@ interface Range extends AbstractRange {
   readonly END_TO_START: 3;
 }
 
-declare var Range: {
+declare const Range: {
   prototype: Range;
   new (): Range;
   readonly START_TO_START: 0;
@@ -28757,10 +28997,10 @@ interface ReadableByteStreamController {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/error)
    */
-  error(e?: any): void;
+  error(e?: unknown): void;
 }
 
-declare var ReadableByteStreamController: {
+declare const ReadableByteStreamController: {
   prototype: ReadableByteStreamController;
   new (): ReadableByteStreamController;
 };
@@ -28772,7 +29012,7 @@ declare var ReadableByteStreamController: {
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream)
  */
-interface ReadableStream<R = any> {
+interface ReadableStream<R = unknown> {
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/locked)
@@ -28782,7 +29022,7 @@ interface ReadableStream<R = any> {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/cancel)
    */
-  cancel(reason?: any): Promise<void>;
+  cancel(reason?: unknown): Promise<void>;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/getReader)
@@ -28813,17 +29053,17 @@ interface ReadableStream<R = any> {
   tee(): [ReadableStream<R>, ReadableStream<R>];
 }
 
-declare var ReadableStream: {
+declare const ReadableStream: {
   prototype: ReadableStream;
   new (
     underlyingSource: UnderlyingByteSource,
     strategy?: { highWaterMark?: number },
   ): ReadableStream<Uint8Array>;
-  new <R = any>(
+  new <R = unknown>(
     underlyingSource: UnderlyingDefaultSource<R>,
     strategy?: QueuingStrategy<R>,
   ): ReadableStream<R>;
-  new <R = any>(
+  new <R = unknown>(
     underlyingSource?: UnderlyingSource<R>,
     strategy?: QueuingStrategy<R>,
   ): ReadableStream<R>;
@@ -28848,7 +29088,7 @@ interface ReadableStreamBYOBReader extends ReadableStreamGenericReader {
   releaseLock(): void;
 }
 
-declare var ReadableStreamBYOBReader: {
+declare const ReadableStreamBYOBReader: {
   prototype: ReadableStreamBYOBReader;
   new (stream: ReadableStream): ReadableStreamBYOBReader;
 };
@@ -28875,7 +29115,7 @@ interface ReadableStreamBYOBRequest {
   respondWithNewView(view: ArrayBufferView): void;
 }
 
-declare var ReadableStreamBYOBRequest: {
+declare const ReadableStreamBYOBRequest: {
   prototype: ReadableStreamBYOBRequest;
   new (): ReadableStreamBYOBRequest;
 };
@@ -28884,7 +29124,7 @@ declare var ReadableStreamBYOBRequest: {
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultController)
  */
-interface ReadableStreamDefaultController<R = any> {
+interface ReadableStreamDefaultController<R = unknown> {
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultController/desiredSize)
@@ -28904,10 +29144,10 @@ interface ReadableStreamDefaultController<R = any> {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultController/error)
    */
-  error(e?: any): void;
+  error(e?: unknown): void;
 }
 
-declare var ReadableStreamDefaultController: {
+declare const ReadableStreamDefaultController: {
   prototype: ReadableStreamDefaultController;
   new (): ReadableStreamDefaultController;
 };
@@ -28916,7 +29156,7 @@ declare var ReadableStreamDefaultController: {
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultReader)
  */
-interface ReadableStreamDefaultReader<R = any>
+interface ReadableStreamDefaultReader<R = unknown>
   extends ReadableStreamGenericReader {
   /**
    * [MDN
@@ -28930,9 +29170,9 @@ interface ReadableStreamDefaultReader<R = any>
   releaseLock(): void;
 }
 
-declare var ReadableStreamDefaultReader: {
+declare const ReadableStreamDefaultReader: {
   prototype: ReadableStreamDefaultReader;
-  new <R = any>(stream: ReadableStream<R>): ReadableStreamDefaultReader<R>;
+  new <R = unknown>(stream: ReadableStream<R>): ReadableStreamDefaultReader<R>;
 };
 
 interface ReadableStreamGenericReader {
@@ -28945,7 +29185,7 @@ interface ReadableStreamGenericReader {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamBYOBReader/cancel)
    */
-  cancel(reason?: any): Promise<void>;
+  cancel(reason?: unknown): Promise<void>;
 }
 
 interface RemotePlaybackEventMap {
@@ -28960,17 +29200,17 @@ interface RemotePlayback extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RemotePlayback/connect_event)
    */
-  onconnect: ((this: RemotePlayback, ev: Event) => any) | null;
+  onconnect: ((this: RemotePlayback, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RemotePlayback/connecting_event)
    */
-  onconnecting: ((this: RemotePlayback, ev: Event) => any) | null;
+  onconnecting: ((this: RemotePlayback, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RemotePlayback/disconnect_event)
    */
-  ondisconnect: ((this: RemotePlayback, ev: Event) => any) | null;
+  ondisconnect: ((this: RemotePlayback, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/RemotePlayback/state)
@@ -28995,7 +29235,7 @@ interface RemotePlayback extends EventTarget {
   ): Promise<number>;
   addEventListener<K extends keyof RemotePlaybackEventMap>(
     type: K,
-    listener: (this: RemotePlayback, ev: RemotePlaybackEventMap[K]) => any,
+    listener: (this: RemotePlayback, ev: RemotePlaybackEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29005,7 +29245,7 @@ interface RemotePlayback extends EventTarget {
   ): void;
   removeEventListener<K extends keyof RemotePlaybackEventMap>(
     type: K,
-    listener: (this: RemotePlayback, ev: RemotePlaybackEventMap[K]) => any,
+    listener: (this: RemotePlayback, ev: RemotePlaybackEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29015,7 +29255,7 @@ interface RemotePlayback extends EventTarget {
   ): void;
 }
 
-declare var RemotePlayback: {
+declare const RemotePlayback: {
   prototype: RemotePlayback;
   new (): RemotePlayback;
 };
@@ -29028,20 +29268,20 @@ interface Report {
   readonly type: string;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Report/url) */
   readonly url: string;
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var Report: {
+declare const Report: {
   prototype: Report;
   new (): Report;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReportBody) */
 interface ReportBody {
-  toJSON(): any;
+  toJSON(): unknown;
 }
 
-declare var ReportBody: {
+declare const ReportBody: {
   prototype: ReportBody;
   new (): ReportBody;
 };
@@ -29065,7 +29305,7 @@ interface ReportingObserver {
   takeRecords(): ReportList;
 }
 
-declare var ReportingObserver: {
+declare const ReportingObserver: {
   prototype: ReportingObserver;
   new (
     callback: ReportingObserverCallback,
@@ -29134,7 +29374,7 @@ interface Request extends Body {
    *
    * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/method)
    */
-  readonly method: string;
+  readonly method: HTTPRequestMethod;
   /**
    * Returns the mode associated with request, which is a string indicating
    * whether the request will use CORS, or will be restricted to same-origin
@@ -29189,7 +29429,7 @@ interface Request extends Body {
   clone(): Request;
 }
 
-declare var Request: {
+declare const Request: {
   prototype: Request;
   new (input: RequestInfo | URL, init?: RequestInit): Request;
 };
@@ -29213,7 +29453,7 @@ interface ResizeObserver {
   unobserve(target: Element): void;
 }
 
-declare var ResizeObserver: {
+declare const ResizeObserver: {
   prototype: ResizeObserver;
   new (callback: ResizeObserverCallback): ResizeObserver;
 };
@@ -29246,7 +29486,7 @@ interface ResizeObserverEntry {
   readonly target: Element;
 }
 
-declare var ResizeObserverEntry: {
+declare const ResizeObserverEntry: {
   prototype: ResizeObserverEntry;
   new (): ResizeObserverEntry;
 };
@@ -29268,7 +29508,7 @@ interface ResizeObserverSize {
   readonly inlineSize: number;
 }
 
-declare var ResizeObserverSize: {
+declare const ResizeObserverSize: {
   prototype: ResizeObserverSize;
   new (): ResizeObserverSize;
 };
@@ -29306,7 +29546,7 @@ interface Response extends Body {
   clone(): Response;
 }
 
-declare var Response: {
+declare const Response: {
   prototype: Response;
   new (body?: BodyInit | null, init?: ResponseInit): Response;
   /**
@@ -29318,7 +29558,7 @@ declare var Response: {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Response/json_static)
    */
-  json(data: any, init?: ResponseInit): Response;
+  json(data: unknown, init?: ResponseInit): Response;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Response/redirect_static)
@@ -29342,7 +29582,7 @@ interface SVGAElement extends SVGGraphicsElement, SVGURIReference {
   readonly target: SVGAnimatedString;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGAElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGAElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29352,7 +29592,7 @@ interface SVGAElement extends SVGGraphicsElement, SVGURIReference {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGAElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGAElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29362,7 +29602,7 @@ interface SVGAElement extends SVGGraphicsElement, SVGURIReference {
   ): void;
 }
 
-declare var SVGAElement: {
+declare const SVGAElement: {
   prototype: SVGAElement;
   new (): SVGAElement;
 };
@@ -29387,7 +29627,7 @@ interface SVGAngle {
   readonly SVG_ANGLETYPE_GRAD: 4;
 }
 
-declare var SVGAngle: {
+declare const SVGAngle: {
   prototype: SVGAngle;
   new (): SVGAngle;
   readonly SVG_ANGLETYPE_UNKNOWN: 0;
@@ -29401,7 +29641,7 @@ declare var SVGAngle: {
 interface SVGAnimateElement extends SVGAnimationElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGAnimateElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGAnimateElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29411,7 +29651,7 @@ interface SVGAnimateElement extends SVGAnimationElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGAnimateElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGAnimateElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29421,7 +29661,7 @@ interface SVGAnimateElement extends SVGAnimationElement {
   ): void;
 }
 
-declare var SVGAnimateElement: {
+declare const SVGAnimateElement: {
   prototype: SVGAnimateElement;
   new (): SVGAnimateElement;
 };
@@ -29433,7 +29673,10 @@ declare var SVGAnimateElement: {
 interface SVGAnimateMotionElement extends SVGAnimationElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGAnimateMotionElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGAnimateMotionElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29443,7 +29686,10 @@ interface SVGAnimateMotionElement extends SVGAnimationElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGAnimateMotionElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGAnimateMotionElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29453,7 +29699,7 @@ interface SVGAnimateMotionElement extends SVGAnimationElement {
   ): void;
 }
 
-declare var SVGAnimateMotionElement: {
+declare const SVGAnimateMotionElement: {
   prototype: SVGAnimateMotionElement;
   new (): SVGAnimateMotionElement;
 };
@@ -29468,7 +29714,7 @@ interface SVGAnimateTransformElement extends SVGAnimationElement {
     listener: (
       this: SVGAnimateTransformElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29481,7 +29727,7 @@ interface SVGAnimateTransformElement extends SVGAnimationElement {
     listener: (
       this: SVGAnimateTransformElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29491,7 +29737,7 @@ interface SVGAnimateTransformElement extends SVGAnimationElement {
   ): void;
 }
 
-declare var SVGAnimateTransformElement: {
+declare const SVGAnimateTransformElement: {
   prototype: SVGAnimateTransformElement;
   new (): SVGAnimateTransformElement;
 };
@@ -29506,7 +29752,7 @@ interface SVGAnimatedAngle {
   readonly baseVal: SVGAngle;
 }
 
-declare var SVGAnimatedAngle: {
+declare const SVGAnimatedAngle: {
   prototype: SVGAnimatedAngle;
   new (): SVGAnimatedAngle;
 };
@@ -29522,7 +29768,7 @@ interface SVGAnimatedBoolean {
   baseVal: boolean;
 }
 
-declare var SVGAnimatedBoolean: {
+declare const SVGAnimatedBoolean: {
   prototype: SVGAnimatedBoolean;
   new (): SVGAnimatedBoolean;
 };
@@ -29539,7 +29785,7 @@ interface SVGAnimatedEnumeration {
   baseVal: number;
 }
 
-declare var SVGAnimatedEnumeration: {
+declare const SVGAnimatedEnumeration: {
   prototype: SVGAnimatedEnumeration;
   new (): SVGAnimatedEnumeration;
 };
@@ -29555,7 +29801,7 @@ interface SVGAnimatedInteger {
   baseVal: number;
 }
 
-declare var SVGAnimatedInteger: {
+declare const SVGAnimatedInteger: {
   prototype: SVGAnimatedInteger;
   new (): SVGAnimatedInteger;
 };
@@ -29570,7 +29816,7 @@ interface SVGAnimatedLength {
   readonly baseVal: SVGLength;
 }
 
-declare var SVGAnimatedLength: {
+declare const SVGAnimatedLength: {
   prototype: SVGAnimatedLength;
   new (): SVGAnimatedLength;
 };
@@ -29586,7 +29832,7 @@ interface SVGAnimatedLengthList {
   readonly baseVal: SVGLengthList;
 }
 
-declare var SVGAnimatedLengthList: {
+declare const SVGAnimatedLengthList: {
   prototype: SVGAnimatedLengthList;
   new (): SVGAnimatedLengthList;
 };
@@ -29601,7 +29847,7 @@ interface SVGAnimatedNumber {
   baseVal: number;
 }
 
-declare var SVGAnimatedNumber: {
+declare const SVGAnimatedNumber: {
   prototype: SVGAnimatedNumber;
   new (): SVGAnimatedNumber;
 };
@@ -29618,7 +29864,7 @@ interface SVGAnimatedNumberList {
   readonly baseVal: SVGNumberList;
 }
 
-declare var SVGAnimatedNumberList: {
+declare const SVGAnimatedNumberList: {
   prototype: SVGAnimatedNumberList;
   new (): SVGAnimatedNumberList;
 };
@@ -29639,7 +29885,7 @@ interface SVGAnimatedPreserveAspectRatio {
   readonly baseVal: SVGPreserveAspectRatio;
 }
 
-declare var SVGAnimatedPreserveAspectRatio: {
+declare const SVGAnimatedPreserveAspectRatio: {
   prototype: SVGAnimatedPreserveAspectRatio;
   new (): SVGAnimatedPreserveAspectRatio;
 };
@@ -29654,7 +29900,7 @@ interface SVGAnimatedRect {
   readonly baseVal: DOMRect;
 }
 
-declare var SVGAnimatedRect: {
+declare const SVGAnimatedRect: {
   prototype: SVGAnimatedRect;
   new (): SVGAnimatedRect;
 };
@@ -29679,7 +29925,7 @@ interface SVGAnimatedString {
   baseVal: string;
 }
 
-declare var SVGAnimatedString: {
+declare const SVGAnimatedString: {
   prototype: SVGAnimatedString;
   new (): SVGAnimatedString;
 };
@@ -29695,7 +29941,7 @@ interface SVGAnimatedTransformList {
   readonly baseVal: SVGTransformList;
 }
 
-declare var SVGAnimatedTransformList: {
+declare const SVGAnimatedTransformList: {
   prototype: SVGAnimatedTransformList;
   new (): SVGAnimatedTransformList;
 };
@@ -29719,7 +29965,7 @@ interface SVGAnimationElement extends SVGElement, SVGTests {
   getStartTime(): number;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGAnimationElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGAnimationElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29729,7 +29975,7 @@ interface SVGAnimationElement extends SVGElement, SVGTests {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGAnimationElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGAnimationElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29739,7 +29985,7 @@ interface SVGAnimationElement extends SVGElement, SVGTests {
   ): void;
 }
 
-declare var SVGAnimationElement: {
+declare const SVGAnimationElement: {
   prototype: SVGAnimationElement;
   new (): SVGAnimationElement;
 };
@@ -29769,7 +30015,7 @@ interface SVGCircleElement extends SVGGeometryElement {
   readonly r: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGCircleElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGCircleElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29779,7 +30025,7 @@ interface SVGCircleElement extends SVGGeometryElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGCircleElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGCircleElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29789,7 +30035,7 @@ interface SVGCircleElement extends SVGGeometryElement {
   ): void;
 }
 
-declare var SVGCircleElement: {
+declare const SVGCircleElement: {
   prototype: SVGCircleElement;
   new (): SVGCircleElement;
 };
@@ -29814,7 +30060,7 @@ interface SVGClipPathElement extends SVGElement {
   readonly transform: SVGAnimatedTransformList;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGClipPathElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGClipPathElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29824,7 +30070,7 @@ interface SVGClipPathElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGClipPathElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGClipPathElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29834,7 +30080,7 @@ interface SVGClipPathElement extends SVGElement {
   ): void;
 }
 
-declare var SVGClipPathElement: {
+declare const SVGClipPathElement: {
   prototype: SVGClipPathElement;
   new (): SVGClipPathElement;
 };
@@ -29864,7 +30110,7 @@ interface SVGComponentTransferFunctionElement extends SVGElement {
     listener: (
       this: SVGComponentTransferFunctionElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29877,7 +30123,7 @@ interface SVGComponentTransferFunctionElement extends SVGElement {
     listener: (
       this: SVGComponentTransferFunctionElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29887,7 +30133,7 @@ interface SVGComponentTransferFunctionElement extends SVGElement {
   ): void;
 }
 
-declare var SVGComponentTransferFunctionElement: {
+declare const SVGComponentTransferFunctionElement: {
   prototype: SVGComponentTransferFunctionElement;
   new (): SVGComponentTransferFunctionElement;
   readonly SVG_FECOMPONENTTRANSFER_TYPE_UNKNOWN: 0;
@@ -29906,7 +30152,7 @@ declare var SVGComponentTransferFunctionElement: {
 interface SVGDefsElement extends SVGGraphicsElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGDefsElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGDefsElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29916,7 +30162,7 @@ interface SVGDefsElement extends SVGGraphicsElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGDefsElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGDefsElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29926,7 +30172,7 @@ interface SVGDefsElement extends SVGGraphicsElement {
   ): void;
 }
 
-declare var SVGDefsElement: {
+declare const SVGDefsElement: {
   prototype: SVGDefsElement;
   new (): SVGDefsElement;
 };
@@ -29939,7 +30185,7 @@ declare var SVGDefsElement: {
 interface SVGDescElement extends SVGElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGDescElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGDescElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29949,7 +30195,7 @@ interface SVGDescElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGDescElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGDescElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -29959,7 +30205,7 @@ interface SVGDescElement extends SVGElement {
   ): void;
 }
 
-declare var SVGDescElement: {
+declare const SVGDescElement: {
   prototype: SVGDescElement;
   new (): SVGDescElement;
 };
@@ -29980,12 +30226,12 @@ interface SVGElement
     GlobalEventHandlers,
     HTMLOrSVGElement {
   /** @deprecated */
-  readonly className: any;
+  // readonly className: unknown;
   readonly ownerSVGElement: SVGSVGElement | null;
   readonly viewportElement: SVGElement | null;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -29995,7 +30241,7 @@ interface SVGElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30005,7 +30251,7 @@ interface SVGElement
   ): void;
 }
 
-declare var SVGElement: {
+declare const SVGElement: {
   prototype: SVGElement;
   new (): SVGElement;
 };
@@ -30022,7 +30268,7 @@ interface SVGEllipseElement extends SVGGeometryElement {
   readonly ry: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGEllipseElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGEllipseElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30032,7 +30278,7 @@ interface SVGEllipseElement extends SVGGeometryElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGEllipseElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGEllipseElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30042,7 +30288,7 @@ interface SVGEllipseElement extends SVGGeometryElement {
   ): void;
 }
 
-declare var SVGEllipseElement: {
+declare const SVGEllipseElement: {
   prototype: SVGEllipseElement;
   new (): SVGEllipseElement;
 };
@@ -30077,7 +30323,7 @@ interface SVGFEBlendElement
   readonly SVG_FEBLEND_MODE_LUMINOSITY: 16;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEBlendElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEBlendElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30087,7 +30333,7 @@ interface SVGFEBlendElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEBlendElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEBlendElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30097,7 +30343,7 @@ interface SVGFEBlendElement
   ): void;
 }
 
-declare var SVGFEBlendElement: {
+declare const SVGFEBlendElement: {
   prototype: SVGFEBlendElement;
   new (): SVGFEBlendElement;
   readonly SVG_FEBLEND_MODE_UNKNOWN: 0;
@@ -30150,7 +30396,10 @@ interface SVGFEColorMatrixElement
   readonly SVG_FECOLORMATRIX_TYPE_LUMINANCETOALPHA: 4;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEColorMatrixElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEColorMatrixElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30160,7 +30409,10 @@ interface SVGFEColorMatrixElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEColorMatrixElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEColorMatrixElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30170,7 +30422,7 @@ interface SVGFEColorMatrixElement
   ): void;
 }
 
-declare var SVGFEColorMatrixElement: {
+declare const SVGFEColorMatrixElement: {
   prototype: SVGFEColorMatrixElement;
   new (): SVGFEColorMatrixElement;
   readonly SVG_FECOLORMATRIX_TYPE_UNKNOWN: 0;
@@ -30195,7 +30447,7 @@ interface SVGFEComponentTransferElement
     listener: (
       this: SVGFEComponentTransferElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30208,7 +30460,7 @@ interface SVGFEComponentTransferElement
     listener: (
       this: SVGFEComponentTransferElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30218,7 +30470,7 @@ interface SVGFEComponentTransferElement
   ): void;
 }
 
-declare var SVGFEComponentTransferElement: {
+declare const SVGFEComponentTransferElement: {
   prototype: SVGFEComponentTransferElement;
   new (): SVGFEComponentTransferElement;
 };
@@ -30248,7 +30500,10 @@ interface SVGFECompositeElement
   readonly SVG_FECOMPOSITE_OPERATOR_ARITHMETIC: 6;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFECompositeElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFECompositeElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30258,7 +30513,10 @@ interface SVGFECompositeElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFECompositeElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFECompositeElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30268,7 +30526,7 @@ interface SVGFECompositeElement
   ): void;
 }
 
-declare var SVGFECompositeElement: {
+declare const SVGFECompositeElement: {
   prototype: SVGFECompositeElement;
   new (): SVGFECompositeElement;
   readonly SVG_FECOMPOSITE_OPERATOR_UNKNOWN: 0;
@@ -30310,7 +30568,7 @@ interface SVGFEConvolveMatrixElement
     listener: (
       this: SVGFEConvolveMatrixElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30323,7 +30581,7 @@ interface SVGFEConvolveMatrixElement
     listener: (
       this: SVGFEConvolveMatrixElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30333,7 +30591,7 @@ interface SVGFEConvolveMatrixElement
   ): void;
 }
 
-declare var SVGFEConvolveMatrixElement: {
+declare const SVGFEConvolveMatrixElement: {
   prototype: SVGFEConvolveMatrixElement;
   new (): SVGFEConvolveMatrixElement;
   readonly SVG_EDGEMODE_UNKNOWN: 0;
@@ -30361,7 +30619,7 @@ interface SVGFEDiffuseLightingElement
     listener: (
       this: SVGFEDiffuseLightingElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30374,7 +30632,7 @@ interface SVGFEDiffuseLightingElement
     listener: (
       this: SVGFEDiffuseLightingElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30384,7 +30642,7 @@ interface SVGFEDiffuseLightingElement
   ): void;
 }
 
-declare var SVGFEDiffuseLightingElement: {
+declare const SVGFEDiffuseLightingElement: {
   prototype: SVGFEDiffuseLightingElement;
   new (): SVGFEDiffuseLightingElement;
 };
@@ -30413,7 +30671,7 @@ interface SVGFEDisplacementMapElement
     listener: (
       this: SVGFEDisplacementMapElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30426,7 +30684,7 @@ interface SVGFEDisplacementMapElement
     listener: (
       this: SVGFEDisplacementMapElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30436,7 +30694,7 @@ interface SVGFEDisplacementMapElement
   ): void;
 }
 
-declare var SVGFEDisplacementMapElement: {
+declare const SVGFEDisplacementMapElement: {
   prototype: SVGFEDisplacementMapElement;
   new (): SVGFEDisplacementMapElement;
   readonly SVG_CHANNEL_UNKNOWN: 0;
@@ -30460,7 +30718,7 @@ interface SVGFEDistantLightElement extends SVGElement {
     listener: (
       this: SVGFEDistantLightElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30473,7 +30731,7 @@ interface SVGFEDistantLightElement extends SVGElement {
     listener: (
       this: SVGFEDistantLightElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30483,7 +30741,7 @@ interface SVGFEDistantLightElement extends SVGElement {
   ): void;
 }
 
-declare var SVGFEDistantLightElement: {
+declare const SVGFEDistantLightElement: {
   prototype: SVGFEDistantLightElement;
   new (): SVGFEDistantLightElement;
 };
@@ -30503,7 +30761,10 @@ interface SVGFEDropShadowElement
   setStdDeviation(stdDeviationX: number, stdDeviationY: number): void;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEDropShadowElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEDropShadowElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30513,7 +30774,10 @@ interface SVGFEDropShadowElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEDropShadowElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEDropShadowElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30523,7 +30787,7 @@ interface SVGFEDropShadowElement
   ): void;
 }
 
-declare var SVGFEDropShadowElement: {
+declare const SVGFEDropShadowElement: {
   prototype: SVGFEDropShadowElement;
   new (): SVGFEDropShadowElement;
 };
@@ -30538,7 +30802,7 @@ interface SVGFEFloodElement
     SVGFilterPrimitiveStandardAttributes {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFloodElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFloodElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30548,7 +30812,7 @@ interface SVGFEFloodElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFloodElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFloodElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30558,7 +30822,7 @@ interface SVGFEFloodElement
   ): void;
 }
 
-declare var SVGFEFloodElement: {
+declare const SVGFEFloodElement: {
   prototype: SVGFEFloodElement;
   new (): SVGFEFloodElement;
 };
@@ -30571,7 +30835,7 @@ declare var SVGFEFloodElement: {
 interface SVGFEFuncAElement extends SVGComponentTransferFunctionElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFuncAElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFuncAElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30581,7 +30845,7 @@ interface SVGFEFuncAElement extends SVGComponentTransferFunctionElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFuncAElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFuncAElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30591,7 +30855,7 @@ interface SVGFEFuncAElement extends SVGComponentTransferFunctionElement {
   ): void;
 }
 
-declare var SVGFEFuncAElement: {
+declare const SVGFEFuncAElement: {
   prototype: SVGFEFuncAElement;
   new (): SVGFEFuncAElement;
 };
@@ -30604,7 +30868,7 @@ declare var SVGFEFuncAElement: {
 interface SVGFEFuncBElement extends SVGComponentTransferFunctionElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFuncBElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFuncBElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30614,7 +30878,7 @@ interface SVGFEFuncBElement extends SVGComponentTransferFunctionElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFuncBElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFuncBElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30624,7 +30888,7 @@ interface SVGFEFuncBElement extends SVGComponentTransferFunctionElement {
   ): void;
 }
 
-declare var SVGFEFuncBElement: {
+declare const SVGFEFuncBElement: {
   prototype: SVGFEFuncBElement;
   new (): SVGFEFuncBElement;
 };
@@ -30637,7 +30901,7 @@ declare var SVGFEFuncBElement: {
 interface SVGFEFuncGElement extends SVGComponentTransferFunctionElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFuncGElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFuncGElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30647,7 +30911,7 @@ interface SVGFEFuncGElement extends SVGComponentTransferFunctionElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFuncGElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFuncGElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30657,7 +30921,7 @@ interface SVGFEFuncGElement extends SVGComponentTransferFunctionElement {
   ): void;
 }
 
-declare var SVGFEFuncGElement: {
+declare const SVGFEFuncGElement: {
   prototype: SVGFEFuncGElement;
   new (): SVGFEFuncGElement;
 };
@@ -30670,7 +30934,7 @@ declare var SVGFEFuncGElement: {
 interface SVGFEFuncRElement extends SVGComponentTransferFunctionElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFuncRElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFuncRElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30680,7 +30944,7 @@ interface SVGFEFuncRElement extends SVGComponentTransferFunctionElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEFuncRElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEFuncRElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30690,7 +30954,7 @@ interface SVGFEFuncRElement extends SVGComponentTransferFunctionElement {
   ): void;
 }
 
-declare var SVGFEFuncRElement: {
+declare const SVGFEFuncRElement: {
   prototype: SVGFEFuncRElement;
   new (): SVGFEFuncRElement;
 };
@@ -30713,7 +30977,7 @@ interface SVGFEGaussianBlurElement
     listener: (
       this: SVGFEGaussianBlurElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30726,7 +30990,7 @@ interface SVGFEGaussianBlurElement
     listener: (
       this: SVGFEGaussianBlurElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30736,7 +31000,7 @@ interface SVGFEGaussianBlurElement
   ): void;
 }
 
-declare var SVGFEGaussianBlurElement: {
+declare const SVGFEGaussianBlurElement: {
   prototype: SVGFEGaussianBlurElement;
   new (): SVGFEGaussianBlurElement;
 };
@@ -30753,7 +31017,7 @@ interface SVGFEImageElement
   readonly preserveAspectRatio: SVGAnimatedPreserveAspectRatio;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEImageElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEImageElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30763,7 +31027,7 @@ interface SVGFEImageElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEImageElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEImageElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30773,7 +31037,7 @@ interface SVGFEImageElement
   ): void;
 }
 
-declare var SVGFEImageElement: {
+declare const SVGFEImageElement: {
   prototype: SVGFEImageElement;
   new (): SVGFEImageElement;
 };
@@ -30788,7 +31052,7 @@ interface SVGFEMergeElement
     SVGFilterPrimitiveStandardAttributes {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEMergeElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEMergeElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30798,7 +31062,7 @@ interface SVGFEMergeElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEMergeElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEMergeElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30808,7 +31072,7 @@ interface SVGFEMergeElement
   ): void;
 }
 
-declare var SVGFEMergeElement: {
+declare const SVGFEMergeElement: {
   prototype: SVGFEMergeElement;
   new (): SVGFEMergeElement;
 };
@@ -30823,7 +31087,10 @@ interface SVGFEMergeNodeElement extends SVGElement {
   readonly in1: SVGAnimatedString;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEMergeNodeElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEMergeNodeElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30833,7 +31100,10 @@ interface SVGFEMergeNodeElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEMergeNodeElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEMergeNodeElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30843,7 +31113,7 @@ interface SVGFEMergeNodeElement extends SVGElement {
   ): void;
 }
 
-declare var SVGFEMergeNodeElement: {
+declare const SVGFEMergeNodeElement: {
   prototype: SVGFEMergeNodeElement;
   new (): SVGFEMergeNodeElement;
 };
@@ -30866,7 +31136,10 @@ interface SVGFEMorphologyElement
   readonly SVG_MORPHOLOGY_OPERATOR_DILATE: 2;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEMorphologyElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEMorphologyElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30876,7 +31149,10 @@ interface SVGFEMorphologyElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEMorphologyElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEMorphologyElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30886,7 +31162,7 @@ interface SVGFEMorphologyElement
   ): void;
 }
 
-declare var SVGFEMorphologyElement: {
+declare const SVGFEMorphologyElement: {
   prototype: SVGFEMorphologyElement;
   new (): SVGFEMorphologyElement;
   readonly SVG_MORPHOLOGY_OPERATOR_UNKNOWN: 0;
@@ -30908,7 +31184,7 @@ interface SVGFEOffsetElement
   readonly in1: SVGAnimatedString;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEOffsetElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEOffsetElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30918,7 +31194,7 @@ interface SVGFEOffsetElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEOffsetElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFEOffsetElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30928,7 +31204,7 @@ interface SVGFEOffsetElement
   ): void;
 }
 
-declare var SVGFEOffsetElement: {
+declare const SVGFEOffsetElement: {
   prototype: SVGFEOffsetElement;
   new (): SVGFEOffsetElement;
 };
@@ -30945,7 +31221,10 @@ interface SVGFEPointLightElement extends SVGElement {
   readonly z: SVGAnimatedNumber;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEPointLightElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEPointLightElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -30955,7 +31234,10 @@ interface SVGFEPointLightElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFEPointLightElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFEPointLightElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -30965,7 +31247,7 @@ interface SVGFEPointLightElement extends SVGElement {
   ): void;
 }
 
-declare var SVGFEPointLightElement: {
+declare const SVGFEPointLightElement: {
   prototype: SVGFEPointLightElement;
   new (): SVGFEPointLightElement;
 };
@@ -30990,7 +31272,7 @@ interface SVGFESpecularLightingElement
     listener: (
       this: SVGFESpecularLightingElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31003,7 +31285,7 @@ interface SVGFESpecularLightingElement
     listener: (
       this: SVGFESpecularLightingElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31013,7 +31295,7 @@ interface SVGFESpecularLightingElement
   ): void;
 }
 
-declare var SVGFESpecularLightingElement: {
+declare const SVGFESpecularLightingElement: {
   prototype: SVGFESpecularLightingElement;
   new (): SVGFESpecularLightingElement;
 };
@@ -31035,7 +31317,10 @@ interface SVGFESpotLightElement extends SVGElement {
   readonly z: SVGAnimatedNumber;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFESpotLightElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFESpotLightElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31045,7 +31330,10 @@ interface SVGFESpotLightElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFESpotLightElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFESpotLightElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31055,7 +31343,7 @@ interface SVGFESpotLightElement extends SVGElement {
   ): void;
 }
 
-declare var SVGFESpotLightElement: {
+declare const SVGFESpotLightElement: {
   prototype: SVGFESpotLightElement;
   new (): SVGFESpotLightElement;
 };
@@ -31071,7 +31359,7 @@ interface SVGFETileElement
   readonly in1: SVGAnimatedString;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFETileElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFETileElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31081,7 +31369,7 @@ interface SVGFETileElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFETileElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFETileElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31091,7 +31379,7 @@ interface SVGFETileElement
   ): void;
 }
 
-declare var SVGFETileElement: {
+declare const SVGFETileElement: {
   prototype: SVGFETileElement;
   new (): SVGFETileElement;
 };
@@ -31119,7 +31407,10 @@ interface SVGFETurbulenceElement
   readonly SVG_STITCHTYPE_NOSTITCH: 2;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFETurbulenceElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFETurbulenceElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31129,7 +31420,10 @@ interface SVGFETurbulenceElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFETurbulenceElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGFETurbulenceElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31139,7 +31433,7 @@ interface SVGFETurbulenceElement
   ): void;
 }
 
-declare var SVGFETurbulenceElement: {
+declare const SVGFETurbulenceElement: {
   prototype: SVGFETurbulenceElement;
   new (): SVGFETurbulenceElement;
   readonly SVG_TURBULENCE_TYPE_UNKNOWN: 0;
@@ -31165,7 +31459,7 @@ interface SVGFilterElement extends SVGElement, SVGURIReference {
   readonly y: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFilterElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFilterElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31175,7 +31469,7 @@ interface SVGFilterElement extends SVGElement, SVGURIReference {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGFilterElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGFilterElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31185,7 +31479,7 @@ interface SVGFilterElement extends SVGElement, SVGURIReference {
   ): void;
 }
 
-declare var SVGFilterElement: {
+declare const SVGFilterElement: {
   prototype: SVGFilterElement;
   new (): SVGFilterElement;
 };
@@ -31225,7 +31519,10 @@ interface SVGForeignObjectElement extends SVGGraphicsElement {
   readonly y: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGForeignObjectElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGForeignObjectElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31235,7 +31532,10 @@ interface SVGForeignObjectElement extends SVGGraphicsElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGForeignObjectElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGForeignObjectElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31245,7 +31545,7 @@ interface SVGForeignObjectElement extends SVGGraphicsElement {
   ): void;
 }
 
-declare var SVGForeignObjectElement: {
+declare const SVGForeignObjectElement: {
   prototype: SVGForeignObjectElement;
   new (): SVGForeignObjectElement;
 };
@@ -31258,7 +31558,7 @@ declare var SVGForeignObjectElement: {
 interface SVGGElement extends SVGGraphicsElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGGElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGGElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31268,7 +31568,7 @@ interface SVGGElement extends SVGGraphicsElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGGElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGGElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31278,7 +31578,7 @@ interface SVGGElement extends SVGGraphicsElement {
   ): void;
 }
 
-declare var SVGGElement: {
+declare const SVGGElement: {
   prototype: SVGGElement;
   new (): SVGGElement;
 };
@@ -31315,7 +31615,7 @@ interface SVGGeometryElement extends SVGGraphicsElement {
   isPointInStroke(point?: DOMPointInit): boolean;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGGeometryElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGGeometryElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31325,7 +31625,7 @@ interface SVGGeometryElement extends SVGGraphicsElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGGeometryElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGGeometryElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31335,7 +31635,7 @@ interface SVGGeometryElement extends SVGGraphicsElement {
   ): void;
 }
 
-declare var SVGGeometryElement: {
+declare const SVGGeometryElement: {
   prototype: SVGGeometryElement;
   new (): SVGGeometryElement;
 };
@@ -31357,7 +31657,7 @@ interface SVGGradientElement extends SVGElement, SVGURIReference {
   readonly SVG_SPREADMETHOD_REPEAT: 3;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGGradientElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGGradientElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31367,7 +31667,7 @@ interface SVGGradientElement extends SVGElement, SVGURIReference {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGGradientElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGGradientElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31377,7 +31677,7 @@ interface SVGGradientElement extends SVGElement, SVGURIReference {
   ): void;
 }
 
-declare var SVGGradientElement: {
+declare const SVGGradientElement: {
   prototype: SVGGradientElement;
   new (): SVGGradientElement;
   readonly SVG_SPREADMETHOD_UNKNOWN: 0;
@@ -31404,7 +31704,7 @@ interface SVGGraphicsElement extends SVGElement, SVGTests {
   getScreenCTM(): DOMMatrix | null;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGGraphicsElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGGraphicsElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31414,7 +31714,7 @@ interface SVGGraphicsElement extends SVGElement, SVGTests {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGGraphicsElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGGraphicsElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31424,7 +31724,7 @@ interface SVGGraphicsElement extends SVGElement, SVGTests {
   ): void;
 }
 
-declare var SVGGraphicsElement: {
+declare const SVGGraphicsElement: {
   prototype: SVGGraphicsElement;
   new (): SVGGraphicsElement;
 };
@@ -31467,7 +31767,7 @@ interface SVGImageElement extends SVGGraphicsElement, SVGURIReference {
   readonly y: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGImageElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGImageElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31477,7 +31777,7 @@ interface SVGImageElement extends SVGGraphicsElement, SVGURIReference {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGImageElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGImageElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31487,7 +31787,7 @@ interface SVGImageElement extends SVGGraphicsElement, SVGURIReference {
   ): void;
 }
 
-declare var SVGImageElement: {
+declare const SVGImageElement: {
   prototype: SVGImageElement;
   new (): SVGImageElement;
 };
@@ -31517,7 +31817,7 @@ interface SVGLength {
   readonly SVG_LENGTHTYPE_PC: 10;
 }
 
-declare var SVGLength: {
+declare const SVGLength: {
   prototype: SVGLength;
   new (): SVGLength;
   readonly SVG_LENGTHTYPE_UNKNOWN: 0;
@@ -31551,7 +31851,7 @@ interface SVGLengthList {
   [index: number]: SVGLength;
 }
 
-declare var SVGLengthList: {
+declare const SVGLengthList: {
   prototype: SVGLengthList;
   new (): SVGLengthList;
 };
@@ -31569,7 +31869,7 @@ interface SVGLineElement extends SVGGeometryElement {
   readonly y2: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGLineElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGLineElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31579,7 +31879,7 @@ interface SVGLineElement extends SVGGeometryElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGLineElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGLineElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31589,7 +31889,7 @@ interface SVGLineElement extends SVGGeometryElement {
   ): void;
 }
 
-declare var SVGLineElement: {
+declare const SVGLineElement: {
   prototype: SVGLineElement;
   new (): SVGLineElement;
 };
@@ -31610,7 +31910,7 @@ interface SVGLinearGradientElement extends SVGGradientElement {
     listener: (
       this: SVGLinearGradientElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31623,7 +31923,7 @@ interface SVGLinearGradientElement extends SVGGradientElement {
     listener: (
       this: SVGLinearGradientElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31633,7 +31933,7 @@ interface SVGLinearGradientElement extends SVGGradientElement {
   ): void;
 }
 
-declare var SVGLinearGradientElement: {
+declare const SVGLinearGradientElement: {
   prototype: SVGLinearGradientElement;
   new (): SVGLinearGradientElement;
 };
@@ -31642,7 +31942,7 @@ declare var SVGLinearGradientElement: {
 interface SVGMPathElement extends SVGElement, SVGURIReference {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGMPathElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGMPathElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31652,7 +31952,7 @@ interface SVGMPathElement extends SVGElement, SVGURIReference {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGMPathElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGMPathElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31662,7 +31962,7 @@ interface SVGMPathElement extends SVGElement, SVGURIReference {
   ): void;
 }
 
-declare var SVGMPathElement: {
+declare const SVGMPathElement: {
   prototype: SVGMPathElement;
   new (): SVGMPathElement;
 };
@@ -31722,7 +32022,7 @@ interface SVGMarkerElement extends SVGElement, SVGFitToViewBox {
   readonly SVG_MARKER_ORIENT_ANGLE: 2;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGMarkerElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGMarkerElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31732,7 +32032,7 @@ interface SVGMarkerElement extends SVGElement, SVGFitToViewBox {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGMarkerElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGMarkerElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31742,7 +32042,7 @@ interface SVGMarkerElement extends SVGElement, SVGFitToViewBox {
   ): void;
 }
 
-declare var SVGMarkerElement: {
+declare const SVGMarkerElement: {
   prototype: SVGMarkerElement;
   new (): SVGMarkerElement;
   readonly SVG_MARKERUNITS_UNKNOWN: 0;
@@ -31792,7 +32092,7 @@ interface SVGMaskElement extends SVGElement {
   readonly y: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGMaskElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGMaskElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31802,7 +32102,7 @@ interface SVGMaskElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGMaskElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGMaskElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31812,7 +32112,7 @@ interface SVGMaskElement extends SVGElement {
   ): void;
 }
 
-declare var SVGMaskElement: {
+declare const SVGMaskElement: {
   prototype: SVGMaskElement;
   new (): SVGMaskElement;
 };
@@ -31826,7 +32126,7 @@ declare var SVGMaskElement: {
 interface SVGMetadataElement extends SVGElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGMetadataElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGMetadataElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31836,7 +32136,7 @@ interface SVGMetadataElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGMetadataElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGMetadataElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31846,7 +32146,7 @@ interface SVGMetadataElement extends SVGElement {
   ): void;
 }
 
-declare var SVGMetadataElement: {
+declare const SVGMetadataElement: {
   prototype: SVGMetadataElement;
   new (): SVGMetadataElement;
 };
@@ -31860,7 +32160,7 @@ interface SVGNumber {
   value: number;
 }
 
-declare var SVGNumber: {
+declare const SVGNumber: {
   prototype: SVGNumber;
   new (): SVGNumber;
 };
@@ -31883,7 +32183,7 @@ interface SVGNumberList {
   [index: number]: SVGNumber;
 }
 
-declare var SVGNumberList: {
+declare const SVGNumberList: {
   prototype: SVGNumberList;
   new (): SVGNumberList;
 };
@@ -31896,7 +32196,7 @@ declare var SVGNumberList: {
 interface SVGPathElement extends SVGGeometryElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGPathElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGPathElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31906,7 +32206,7 @@ interface SVGPathElement extends SVGGeometryElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGPathElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGPathElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31916,7 +32216,7 @@ interface SVGPathElement extends SVGGeometryElement {
   ): void;
 }
 
-declare var SVGPathElement: {
+declare const SVGPathElement: {
   prototype: SVGPathElement;
   new (): SVGPathElement;
 };
@@ -31939,7 +32239,7 @@ interface SVGPatternElement
   readonly y: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGPatternElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGPatternElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -31949,7 +32249,7 @@ interface SVGPatternElement
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGPatternElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGPatternElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -31959,7 +32259,7 @@ interface SVGPatternElement
   ): void;
 }
 
-declare var SVGPatternElement: {
+declare const SVGPatternElement: {
   prototype: SVGPatternElement;
   new (): SVGPatternElement;
 };
@@ -32014,7 +32314,7 @@ interface SVGPointList {
   [index: number]: DOMPoint;
 }
 
-declare var SVGPointList: {
+declare const SVGPointList: {
   prototype: SVGPointList;
   new (): SVGPointList;
 };
@@ -32028,7 +32328,7 @@ declare var SVGPointList: {
 interface SVGPolygonElement extends SVGGeometryElement, SVGAnimatedPoints {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGPolygonElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGPolygonElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32038,7 +32338,7 @@ interface SVGPolygonElement extends SVGGeometryElement, SVGAnimatedPoints {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGPolygonElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGPolygonElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32048,7 +32348,7 @@ interface SVGPolygonElement extends SVGGeometryElement, SVGAnimatedPoints {
   ): void;
 }
 
-declare var SVGPolygonElement: {
+declare const SVGPolygonElement: {
   prototype: SVGPolygonElement;
   new (): SVGPolygonElement;
 };
@@ -32063,7 +32363,7 @@ declare var SVGPolygonElement: {
 interface SVGPolylineElement extends SVGGeometryElement, SVGAnimatedPoints {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGPolylineElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGPolylineElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32073,7 +32373,7 @@ interface SVGPolylineElement extends SVGGeometryElement, SVGAnimatedPoints {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGPolylineElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGPolylineElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32083,7 +32383,7 @@ interface SVGPolylineElement extends SVGGeometryElement, SVGAnimatedPoints {
   ): void;
 }
 
-declare var SVGPolylineElement: {
+declare const SVGPolylineElement: {
   prototype: SVGPolylineElement;
   new (): SVGPolylineElement;
 };
@@ -32114,7 +32414,7 @@ interface SVGPreserveAspectRatio {
   readonly SVG_MEETORSLICE_SLICE: 2;
 }
 
-declare var SVGPreserveAspectRatio: {
+declare const SVGPreserveAspectRatio: {
   prototype: SVGPreserveAspectRatio;
   new (): SVGPreserveAspectRatio;
   readonly SVG_PRESERVEASPECTRATIO_UNKNOWN: 0;
@@ -32151,7 +32451,7 @@ interface SVGRadialGradientElement extends SVGGradientElement {
     listener: (
       this: SVGRadialGradientElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32164,7 +32464,7 @@ interface SVGRadialGradientElement extends SVGGradientElement {
     listener: (
       this: SVGRadialGradientElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32174,7 +32474,7 @@ interface SVGRadialGradientElement extends SVGGradientElement {
   ): void;
 }
 
-declare var SVGRadialGradientElement: {
+declare const SVGRadialGradientElement: {
   prototype: SVGRadialGradientElement;
   new (): SVGRadialGradientElement;
 };
@@ -32194,7 +32494,7 @@ interface SVGRectElement extends SVGGeometryElement {
   readonly y: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGRectElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGRectElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32204,7 +32504,7 @@ interface SVGRectElement extends SVGGeometryElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGRectElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGRectElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32214,7 +32514,7 @@ interface SVGRectElement extends SVGGeometryElement {
   ): void;
 }
 
-declare var SVGRectElement: {
+declare const SVGRectElement: {
   prototype: SVGRectElement;
   new (): SVGRectElement;
 };
@@ -32298,7 +32598,7 @@ interface SVGSVGElement
   unsuspendRedrawAll(): void;
   addEventListener<K extends keyof SVGSVGElementEventMap>(
     type: K,
-    listener: (this: SVGSVGElement, ev: SVGSVGElementEventMap[K]) => any,
+    listener: (this: SVGSVGElement, ev: SVGSVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32308,7 +32608,7 @@ interface SVGSVGElement
   ): void;
   removeEventListener<K extends keyof SVGSVGElementEventMap>(
     type: K,
-    listener: (this: SVGSVGElement, ev: SVGSVGElementEventMap[K]) => any,
+    listener: (this: SVGSVGElement, ev: SVGSVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32318,7 +32618,7 @@ interface SVGSVGElement
   ): void;
 }
 
-declare var SVGSVGElement: {
+declare const SVGSVGElement: {
   prototype: SVGSVGElement;
   new (): SVGSVGElement;
 };
@@ -32332,7 +32632,7 @@ interface SVGScriptElement extends SVGElement, SVGURIReference {
   type: string;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGScriptElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGScriptElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32342,7 +32642,7 @@ interface SVGScriptElement extends SVGElement, SVGURIReference {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGScriptElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGScriptElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32352,7 +32652,7 @@ interface SVGScriptElement extends SVGElement, SVGURIReference {
   ): void;
 }
 
-declare var SVGScriptElement: {
+declare const SVGScriptElement: {
   prototype: SVGScriptElement;
   new (): SVGScriptElement;
 };
@@ -32361,7 +32661,7 @@ declare var SVGScriptElement: {
 interface SVGSetElement extends SVGAnimationElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGSetElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGSetElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32371,7 +32671,7 @@ interface SVGSetElement extends SVGAnimationElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGSetElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGSetElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32381,7 +32681,7 @@ interface SVGSetElement extends SVGAnimationElement {
   ): void;
 }
 
-declare var SVGSetElement: {
+declare const SVGSetElement: {
   prototype: SVGSetElement;
   new (): SVGSetElement;
 };
@@ -32395,7 +32695,7 @@ interface SVGStopElement extends SVGElement {
   readonly offset: SVGAnimatedNumber;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGStopElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGStopElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32405,7 +32705,7 @@ interface SVGStopElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGStopElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGStopElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32415,7 +32715,7 @@ interface SVGStopElement extends SVGElement {
   ): void;
 }
 
-declare var SVGStopElement: {
+declare const SVGStopElement: {
   prototype: SVGStopElement;
   new (): SVGStopElement;
 };
@@ -32438,7 +32738,7 @@ interface SVGStringList {
   [index: number]: string;
 }
 
-declare var SVGStringList: {
+declare const SVGStringList: {
   prototype: SVGStringList;
   new (): SVGStringList;
 };
@@ -32469,7 +32769,7 @@ interface SVGStyleElement extends SVGElement, LinkStyle {
   type: string;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGStyleElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGStyleElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32479,7 +32779,7 @@ interface SVGStyleElement extends SVGElement, LinkStyle {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGStyleElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGStyleElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32489,7 +32789,7 @@ interface SVGStyleElement extends SVGElement, LinkStyle {
   ): void;
 }
 
-declare var SVGStyleElement: {
+declare const SVGStyleElement: {
   prototype: SVGStyleElement;
   new (): SVGStyleElement;
 };
@@ -32502,7 +32802,7 @@ declare var SVGStyleElement: {
 interface SVGSwitchElement extends SVGGraphicsElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGSwitchElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGSwitchElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32512,7 +32812,7 @@ interface SVGSwitchElement extends SVGGraphicsElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGSwitchElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGSwitchElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32522,7 +32822,7 @@ interface SVGSwitchElement extends SVGGraphicsElement {
   ): void;
 }
 
-declare var SVGSwitchElement: {
+declare const SVGSwitchElement: {
   prototype: SVGSwitchElement;
   new (): SVGSwitchElement;
 };
@@ -32535,7 +32835,7 @@ declare var SVGSwitchElement: {
 interface SVGSymbolElement extends SVGElement, SVGFitToViewBox {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGSymbolElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGSymbolElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32545,7 +32845,7 @@ interface SVGSymbolElement extends SVGElement, SVGFitToViewBox {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGSymbolElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGSymbolElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32555,7 +32855,7 @@ interface SVGSymbolElement extends SVGElement, SVGFitToViewBox {
   ): void;
 }
 
-declare var SVGSymbolElement: {
+declare const SVGSymbolElement: {
   prototype: SVGSymbolElement;
   new (): SVGSymbolElement;
 };
@@ -32568,7 +32868,7 @@ declare var SVGSymbolElement: {
 interface SVGTSpanElement extends SVGTextPositioningElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTSpanElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGTSpanElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32578,7 +32878,7 @@ interface SVGTSpanElement extends SVGTextPositioningElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTSpanElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGTSpanElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32588,7 +32888,7 @@ interface SVGTSpanElement extends SVGTextPositioningElement {
   ): void;
 }
 
-declare var SVGTSpanElement: {
+declare const SVGTSpanElement: {
   prototype: SVGTSpanElement;
   new (): SVGTSpanElement;
 };
@@ -32624,7 +32924,10 @@ interface SVGTextContentElement extends SVGGraphicsElement {
   readonly LENGTHADJUST_SPACINGANDGLYPHS: 2;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTextContentElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGTextContentElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32634,7 +32937,10 @@ interface SVGTextContentElement extends SVGGraphicsElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTextContentElement, ev: SVGElementEventMap[K]) => any,
+    listener: (
+      this: SVGTextContentElement,
+      ev: SVGElementEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32644,7 +32950,7 @@ interface SVGTextContentElement extends SVGGraphicsElement {
   ): void;
 }
 
-declare var SVGTextContentElement: {
+declare const SVGTextContentElement: {
   prototype: SVGTextContentElement;
   new (): SVGTextContentElement;
   readonly LENGTHADJUST_UNKNOWN: 0;
@@ -32660,7 +32966,7 @@ declare var SVGTextContentElement: {
 interface SVGTextElement extends SVGTextPositioningElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTextElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGTextElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32670,7 +32976,7 @@ interface SVGTextElement extends SVGTextPositioningElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTextElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGTextElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32680,7 +32986,7 @@ interface SVGTextElement extends SVGTextPositioningElement {
   ): void;
 }
 
-declare var SVGTextElement: {
+declare const SVGTextElement: {
   prototype: SVGTextElement;
   new (): SVGTextElement;
 };
@@ -32703,7 +33009,7 @@ interface SVGTextPathElement extends SVGTextContentElement, SVGURIReference {
   readonly TEXTPATH_SPACINGTYPE_EXACT: 2;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTextPathElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGTextPathElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32713,7 +33019,7 @@ interface SVGTextPathElement extends SVGTextContentElement, SVGURIReference {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTextPathElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGTextPathElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32723,7 +33029,7 @@ interface SVGTextPathElement extends SVGTextContentElement, SVGURIReference {
   ): void;
 }
 
-declare var SVGTextPathElement: {
+declare const SVGTextPathElement: {
   prototype: SVGTextPathElement;
   new (): SVGTextPathElement;
   readonly TEXTPATH_METHODTYPE_UNKNOWN: 0;
@@ -32753,7 +33059,7 @@ interface SVGTextPositioningElement extends SVGTextContentElement {
     listener: (
       this: SVGTextPositioningElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32766,7 +33072,7 @@ interface SVGTextPositioningElement extends SVGTextContentElement {
     listener: (
       this: SVGTextPositioningElement,
       ev: SVGElementEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32776,7 +33082,7 @@ interface SVGTextPositioningElement extends SVGTextContentElement {
   ): void;
 }
 
-declare var SVGTextPositioningElement: {
+declare const SVGTextPositioningElement: {
   prototype: SVGTextPositioningElement;
   new (): SVGTextPositioningElement;
 };
@@ -32789,7 +33095,7 @@ declare var SVGTextPositioningElement: {
 interface SVGTitleElement extends SVGElement {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTitleElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGTitleElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32799,7 +33105,7 @@ interface SVGTitleElement extends SVGElement {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGTitleElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGTitleElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32809,7 +33115,7 @@ interface SVGTitleElement extends SVGElement {
   ): void;
 }
 
-declare var SVGTitleElement: {
+declare const SVGTitleElement: {
   prototype: SVGTitleElement;
   new (): SVGTitleElement;
 };
@@ -32840,7 +33146,7 @@ interface SVGTransform {
   readonly SVG_TRANSFORM_SKEWY: 6;
 }
 
-declare var SVGTransform: {
+declare const SVGTransform: {
   prototype: SVGTransform;
   new (): SVGTransform;
   readonly SVG_TRANSFORM_UNKNOWN: 0;
@@ -32872,7 +33178,7 @@ interface SVGTransformList {
   [index: number]: SVGTransform;
 }
 
-declare var SVGTransformList: {
+declare const SVGTransformList: {
   prototype: SVGTransformList;
   new (): SVGTransformList;
 };
@@ -32893,7 +33199,7 @@ interface SVGUnitTypes {
   readonly SVG_UNIT_TYPE_OBJECTBOUNDINGBOX: 2;
 }
 
-declare var SVGUnitTypes: {
+declare const SVGUnitTypes: {
   prototype: SVGUnitTypes;
   new (): SVGUnitTypes;
   readonly SVG_UNIT_TYPE_UNKNOWN: 0;
@@ -32913,7 +33219,7 @@ interface SVGUseElement extends SVGGraphicsElement, SVGURIReference {
   readonly y: SVGAnimatedLength;
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGUseElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGUseElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32923,7 +33229,7 @@ interface SVGUseElement extends SVGGraphicsElement, SVGURIReference {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGUseElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGUseElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32933,7 +33239,7 @@ interface SVGUseElement extends SVGGraphicsElement, SVGURIReference {
   ): void;
 }
 
-declare var SVGUseElement: {
+declare const SVGUseElement: {
   prototype: SVGUseElement;
   new (): SVGUseElement;
 };
@@ -32947,7 +33253,7 @@ declare var SVGUseElement: {
 interface SVGViewElement extends SVGElement, SVGFitToViewBox {
   addEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGViewElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGViewElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -32957,7 +33263,7 @@ interface SVGViewElement extends SVGElement, SVGFitToViewBox {
   ): void;
   removeEventListener<K extends keyof SVGElementEventMap>(
     type: K,
-    listener: (this: SVGViewElement, ev: SVGElementEventMap[K]) => any,
+    listener: (this: SVGViewElement, ev: SVGElementEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -32967,7 +33273,7 @@ interface SVGViewElement extends SVGElement, SVGFitToViewBox {
   ): void;
 }
 
-declare var SVGViewElement: {
+declare const SVGViewElement: {
   prototype: SVGViewElement;
   new (): SVGViewElement;
 };
@@ -33010,7 +33316,7 @@ interface Screen {
   readonly width: number;
 }
 
-declare var Screen: {
+declare const Screen: {
   prototype: Screen;
   new (): Screen;
 };
@@ -33026,7 +33332,7 @@ interface ScreenOrientation extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/ScreenOrientation/angle)
    */
   readonly angle: number;
-  onchange: ((this: ScreenOrientation, ev: Event) => any) | null;
+  onchange: ((this: ScreenOrientation, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ScreenOrientation/type)
@@ -33042,7 +33348,7 @@ interface ScreenOrientation extends EventTarget {
     listener: (
       this: ScreenOrientation,
       ev: ScreenOrientationEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33055,7 +33361,7 @@ interface ScreenOrientation extends EventTarget {
     listener: (
       this: ScreenOrientation,
       ev: ScreenOrientationEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33065,7 +33371,7 @@ interface ScreenOrientation extends EventTarget {
   ): void;
 }
 
-declare var ScreenOrientation: {
+declare const ScreenOrientation: {
   prototype: ScreenOrientation;
   new (): ScreenOrientation;
 };
@@ -33099,14 +33405,14 @@ interface ScriptProcessorNode extends AudioNode {
    *   Reference](https://developer.mozilla.org/docs/Web/API/ScriptProcessorNode/audioprocess_event)
    */
   onaudioprocess:
-    | ((this: ScriptProcessorNode, ev: AudioProcessingEvent) => any)
+    | ((this: ScriptProcessorNode, ev: AudioProcessingEvent) => unknown)
     | null;
   addEventListener<K extends keyof ScriptProcessorNodeEventMap>(
     type: K,
     listener: (
       this: ScriptProcessorNode,
       ev: ScriptProcessorNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33119,7 +33425,7 @@ interface ScriptProcessorNode extends AudioNode {
     listener: (
       this: ScriptProcessorNode,
       ev: ScriptProcessorNodeEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33130,7 +33436,7 @@ interface ScriptProcessorNode extends AudioNode {
 }
 
 /** @deprecated */
-declare var ScriptProcessorNode: {
+declare const ScriptProcessorNode: {
   prototype: ScriptProcessorNode;
   new (): ScriptProcessorNode;
 };
@@ -33205,7 +33511,7 @@ interface SecurityPolicyViolationEvent extends Event {
   readonly violatedDirective: string;
 }
 
-declare var SecurityPolicyViolationEvent: {
+declare const SecurityPolicyViolationEvent: {
   prototype: SecurityPolicyViolationEvent;
   new (
     type: string,
@@ -33336,7 +33642,7 @@ interface Selection {
   toString(): string;
 }
 
-declare var Selection: {
+declare const Selection: {
   prototype: Selection;
   new (): Selection;
 };
@@ -33358,7 +33664,7 @@ interface ServiceWorker extends EventTarget, AbstractWorker {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorker/statechange_event)
    */
-  onstatechange: ((this: ServiceWorker, ev: Event) => any) | null;
+  onstatechange: ((this: ServiceWorker, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorker/scriptURL)
@@ -33373,11 +33679,11 @@ interface ServiceWorker extends EventTarget, AbstractWorker {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorker/postMessage)
    */
-  postMessage(message: any, transfer: Transferable[]): void;
-  postMessage(message: any, options?: StructuredSerializeOptions): void;
+  postMessage(message: unknown, transfer: readonly Transferable[]): void;
+  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
   addEventListener<K extends keyof ServiceWorkerEventMap>(
     type: K,
-    listener: (this: ServiceWorker, ev: ServiceWorkerEventMap[K]) => any,
+    listener: (this: ServiceWorker, ev: ServiceWorkerEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33387,7 +33693,7 @@ interface ServiceWorker extends EventTarget, AbstractWorker {
   ): void;
   removeEventListener<K extends keyof ServiceWorkerEventMap>(
     type: K,
-    listener: (this: ServiceWorker, ev: ServiceWorkerEventMap[K]) => any,
+    listener: (this: ServiceWorker, ev: ServiceWorkerEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33397,7 +33703,7 @@ interface ServiceWorker extends EventTarget, AbstractWorker {
   ): void;
 }
 
-declare var ServiceWorker: {
+declare const ServiceWorker: {
   prototype: ServiceWorker;
   new (): ServiceWorker;
 };
@@ -33428,18 +33734,22 @@ interface ServiceWorkerContainer extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorkerContainer/controllerchange_event)
    */
-  oncontrollerchange: ((this: ServiceWorkerContainer, ev: Event) => any) | null;
+  oncontrollerchange:
+    | ((this: ServiceWorkerContainer, ev: Event) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorkerContainer/message_event)
    */
-  onmessage: ((this: ServiceWorkerContainer, ev: MessageEvent) => any) | null;
+  onmessage:
+    | ((this: ServiceWorkerContainer, ev: MessageEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorkerContainer/messageerror_event)
    */
   onmessageerror:
-    | ((this: ServiceWorkerContainer, ev: MessageEvent) => any)
+    | ((this: ServiceWorkerContainer, ev: MessageEvent) => unknown)
     | null;
   /**
    * [MDN
@@ -33476,7 +33786,7 @@ interface ServiceWorkerContainer extends EventTarget {
     listener: (
       this: ServiceWorkerContainer,
       ev: ServiceWorkerContainerEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33489,7 +33799,7 @@ interface ServiceWorkerContainer extends EventTarget {
     listener: (
       this: ServiceWorkerContainer,
       ev: ServiceWorkerContainerEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33499,7 +33809,7 @@ interface ServiceWorkerContainer extends EventTarget {
   ): void;
 }
 
-declare var ServiceWorkerContainer: {
+declare const ServiceWorkerContainer: {
   prototype: ServiceWorkerContainer;
   new (): ServiceWorkerContainer;
 };
@@ -33536,7 +33846,9 @@ interface ServiceWorkerRegistration extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorkerRegistration/updatefound_event)
    */
-  onupdatefound: ((this: ServiceWorkerRegistration, ev: Event) => any) | null;
+  onupdatefound:
+    | ((this: ServiceWorkerRegistration, ev: Event) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorkerRegistration/pushManager)
@@ -33561,7 +33873,9 @@ interface ServiceWorkerRegistration extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorkerRegistration/getNotifications)
    */
-  getNotifications(filter?: GetNotificationOptions): Promise<Notification[]>;
+  getNotifications(
+    filter?: GetNotificationOptions,
+  ): Promise<readonly Notification[]>;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorkerRegistration/showNotification)
@@ -33582,7 +33896,7 @@ interface ServiceWorkerRegistration extends EventTarget {
     listener: (
       this: ServiceWorkerRegistration,
       ev: ServiceWorkerRegistrationEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33595,7 +33909,7 @@ interface ServiceWorkerRegistration extends EventTarget {
     listener: (
       this: ServiceWorkerRegistration,
       ev: ServiceWorkerRegistrationEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33605,7 +33919,7 @@ interface ServiceWorkerRegistration extends EventTarget {
   ): void;
 }
 
-declare var ServiceWorkerRegistration: {
+declare const ServiceWorkerRegistration: {
   prototype: ServiceWorkerRegistration;
   new (): ServiceWorkerRegistration;
 };
@@ -33625,7 +33939,7 @@ interface ShadowRoot extends DocumentFragment, DocumentOrShadowRoot, InnerHTML {
   readonly host: Element;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ShadowRoot/mode) */
   readonly mode: ShadowRootMode;
-  onslotchange: ((this: ShadowRoot, ev: Event) => any) | null;
+  onslotchange: ((this: ShadowRoot, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/ShadowRoot/slotAssignment)
@@ -33637,7 +33951,7 @@ interface ShadowRoot extends DocumentFragment, DocumentOrShadowRoot, InnerHTML {
    */
   addEventListener<K extends keyof ShadowRootEventMap>(
     type: K,
-    listener: (this: ShadowRoot, ev: ShadowRootEventMap[K]) => any,
+    listener: (this: ShadowRoot, ev: ShadowRootEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33647,7 +33961,7 @@ interface ShadowRoot extends DocumentFragment, DocumentOrShadowRoot, InnerHTML {
   ): void;
   removeEventListener<K extends keyof ShadowRootEventMap>(
     type: K,
-    listener: (this: ShadowRoot, ev: ShadowRootEventMap[K]) => any,
+    listener: (this: ShadowRoot, ev: ShadowRootEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33657,7 +33971,7 @@ interface ShadowRoot extends DocumentFragment, DocumentOrShadowRoot, InnerHTML {
   ): void;
 }
 
-declare var ShadowRoot: {
+declare const ShadowRoot: {
   prototype: ShadowRoot;
   new (): ShadowRoot;
 };
@@ -33674,7 +33988,7 @@ interface SharedWorker extends EventTarget, AbstractWorker {
   readonly port: MessagePort;
   addEventListener<K extends keyof AbstractWorkerEventMap>(
     type: K,
-    listener: (this: SharedWorker, ev: AbstractWorkerEventMap[K]) => any,
+    listener: (this: SharedWorker, ev: AbstractWorkerEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33684,7 +33998,7 @@ interface SharedWorker extends EventTarget, AbstractWorker {
   ): void;
   removeEventListener<K extends keyof AbstractWorkerEventMap>(
     type: K,
-    listener: (this: SharedWorker, ev: AbstractWorkerEventMap[K]) => any,
+    listener: (this: SharedWorker, ev: AbstractWorkerEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33694,7 +34008,7 @@ interface SharedWorker extends EventTarget, AbstractWorker {
   ): void;
 }
 
-declare var SharedWorker: {
+declare const SharedWorker: {
   prototype: SharedWorker;
   new (scriptURL: string | URL, options?: string | WorkerOptions): SharedWorker;
 };
@@ -33746,27 +34060,27 @@ interface SourceBuffer extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SourceBuffer/abort_event)
    */
-  onabort: ((this: SourceBuffer, ev: Event) => any) | null;
+  onabort: ((this: SourceBuffer, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SourceBuffer/error_event)
    */
-  onerror: ((this: SourceBuffer, ev: Event) => any) | null;
+  onerror: ((this: SourceBuffer, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SourceBuffer/update_event)
    */
-  onupdate: ((this: SourceBuffer, ev: Event) => any) | null;
+  onupdate: ((this: SourceBuffer, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SourceBuffer/updateend_event)
    */
-  onupdateend: ((this: SourceBuffer, ev: Event) => any) | null;
+  onupdateend: ((this: SourceBuffer, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SourceBuffer/updatestart_event)
    */
-  onupdatestart: ((this: SourceBuffer, ev: Event) => any) | null;
+  onupdatestart: ((this: SourceBuffer, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SourceBuffer/timestampOffset)
@@ -33799,7 +34113,7 @@ interface SourceBuffer extends EventTarget {
   remove(start: number, end: number): void;
   addEventListener<K extends keyof SourceBufferEventMap>(
     type: K,
-    listener: (this: SourceBuffer, ev: SourceBufferEventMap[K]) => any,
+    listener: (this: SourceBuffer, ev: SourceBufferEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33809,7 +34123,7 @@ interface SourceBuffer extends EventTarget {
   ): void;
   removeEventListener<K extends keyof SourceBufferEventMap>(
     type: K,
-    listener: (this: SourceBuffer, ev: SourceBufferEventMap[K]) => any,
+    listener: (this: SourceBuffer, ev: SourceBufferEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33819,7 +34133,7 @@ interface SourceBuffer extends EventTarget {
   ): void;
 }
 
-declare var SourceBuffer: {
+declare const SourceBuffer: {
   prototype: SourceBuffer;
   new (): SourceBuffer;
 };
@@ -33844,15 +34158,18 @@ interface SourceBufferList extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SourceBufferList/addsourcebuffer_event)
    */
-  onaddsourcebuffer: ((this: SourceBufferList, ev: Event) => any) | null;
+  onaddsourcebuffer: ((this: SourceBufferList, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SourceBufferList/removesourcebuffer_event)
    */
-  onremovesourcebuffer: ((this: SourceBufferList, ev: Event) => any) | null;
+  onremovesourcebuffer: ((this: SourceBufferList, ev: Event) => unknown) | null;
   addEventListener<K extends keyof SourceBufferListEventMap>(
     type: K,
-    listener: (this: SourceBufferList, ev: SourceBufferListEventMap[K]) => any,
+    listener: (
+      this: SourceBufferList,
+      ev: SourceBufferListEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -33862,7 +34179,10 @@ interface SourceBufferList extends EventTarget {
   ): void;
   removeEventListener<K extends keyof SourceBufferListEventMap>(
     type: K,
-    listener: (this: SourceBufferList, ev: SourceBufferListEventMap[K]) => any,
+    listener: (
+      this: SourceBufferList,
+      ev: SourceBufferListEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -33873,7 +34193,7 @@ interface SourceBufferList extends EventTarget {
   [index: number]: SourceBuffer;
 }
 
-declare var SourceBufferList: {
+declare const SourceBufferList: {
   prototype: SourceBufferList;
   new (): SourceBufferList;
 };
@@ -33895,7 +34215,7 @@ interface SpeechRecognitionAlternative {
   readonly transcript: string;
 }
 
-declare var SpeechRecognitionAlternative: {
+declare const SpeechRecognitionAlternative: {
   prototype: SpeechRecognitionAlternative;
   new (): SpeechRecognitionAlternative;
 };
@@ -33923,7 +34243,7 @@ interface SpeechRecognitionResult {
   [index: number]: SpeechRecognitionAlternative;
 }
 
-declare var SpeechRecognitionResult: {
+declare const SpeechRecognitionResult: {
   prototype: SpeechRecognitionResult;
   new (): SpeechRecognitionResult;
 };
@@ -33946,7 +34266,7 @@ interface SpeechRecognitionResultList {
   [index: number]: SpeechRecognitionResult;
 }
 
-declare var SpeechRecognitionResultList: {
+declare const SpeechRecognitionResultList: {
   prototype: SpeechRecognitionResultList;
   new (): SpeechRecognitionResultList;
 };
@@ -33967,7 +34287,7 @@ interface SpeechSynthesis extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesis/voiceschanged_event)
    */
-  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => any) | null;
+  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesis/paused)
@@ -33992,7 +34312,7 @@ interface SpeechSynthesis extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesis/getVoices)
    */
-  getVoices(): SpeechSynthesisVoice[];
+  getVoices(): readonly SpeechSynthesisVoice[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesis/pause)
@@ -34010,7 +34330,10 @@ interface SpeechSynthesis extends EventTarget {
   speak(utterance: SpeechSynthesisUtterance): void;
   addEventListener<K extends keyof SpeechSynthesisEventMap>(
     type: K,
-    listener: (this: SpeechSynthesis, ev: SpeechSynthesisEventMap[K]) => any,
+    listener: (
+      this: SpeechSynthesis,
+      ev: SpeechSynthesisEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -34020,7 +34343,10 @@ interface SpeechSynthesis extends EventTarget {
   ): void;
   removeEventListener<K extends keyof SpeechSynthesisEventMap>(
     type: K,
-    listener: (this: SpeechSynthesis, ev: SpeechSynthesisEventMap[K]) => any,
+    listener: (
+      this: SpeechSynthesis,
+      ev: SpeechSynthesisEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -34030,7 +34356,7 @@ interface SpeechSynthesis extends EventTarget {
   ): void;
 }
 
-declare var SpeechSynthesis: {
+declare const SpeechSynthesis: {
   prototype: SpeechSynthesis;
   new (): SpeechSynthesis;
 };
@@ -34047,7 +34373,7 @@ interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
   readonly error: SpeechSynthesisErrorCode;
 }
 
-declare var SpeechSynthesisErrorEvent: {
+declare const SpeechSynthesisErrorEvent: {
   prototype: SpeechSynthesisErrorEvent;
   new (
     type: string,
@@ -34091,7 +34417,7 @@ interface SpeechSynthesisEvent extends Event {
   readonly utterance: SpeechSynthesisUtterance;
 }
 
-declare var SpeechSynthesisEvent: {
+declare const SpeechSynthesisEvent: {
   prototype: SpeechSynthesisEvent;
   new (
     type: string,
@@ -34128,49 +34454,52 @@ interface SpeechSynthesisUtterance extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/boundary_event)
    */
   onboundary:
-    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
+    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/end_event)
    */
   onend:
-    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
+    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/error_event)
    */
   onerror:
-    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any)
+    | ((
+        this: SpeechSynthesisUtterance,
+        ev: SpeechSynthesisErrorEvent,
+      ) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/mark_event)
    */
   onmark:
-    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
+    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/pause_event)
    */
   onpause:
-    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
+    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/resume_event)
    */
   onresume:
-    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
+    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/start_event)
    */
   onstart:
-    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
+    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
     | null;
   /**
    * [MDN
@@ -34202,7 +34531,7 @@ interface SpeechSynthesisUtterance extends EventTarget {
     listener: (
       this: SpeechSynthesisUtterance,
       ev: SpeechSynthesisUtteranceEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -34215,7 +34544,7 @@ interface SpeechSynthesisUtterance extends EventTarget {
     listener: (
       this: SpeechSynthesisUtterance,
       ev: SpeechSynthesisUtteranceEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -34225,7 +34554,7 @@ interface SpeechSynthesisUtterance extends EventTarget {
   ): void;
 }
 
-declare var SpeechSynthesisUtterance: {
+declare const SpeechSynthesisUtterance: {
   prototype: SpeechSynthesisUtterance;
   new (text?: string): SpeechSynthesisUtterance;
 };
@@ -34266,7 +34595,7 @@ interface SpeechSynthesisVoice {
   readonly voiceURI: string;
 }
 
-declare var SpeechSynthesisVoice: {
+declare const SpeechSynthesisVoice: {
   prototype: SpeechSynthesisVoice;
   new (): SpeechSynthesisVoice;
 };
@@ -34274,7 +34603,7 @@ declare var SpeechSynthesisVoice: {
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/StaticRange) */
 interface StaticRange extends AbstractRange {}
 
-declare var StaticRange: {
+declare const StaticRange: {
   prototype: StaticRange;
   new (init: StaticRangeInit): StaticRange;
 };
@@ -34294,7 +34623,7 @@ interface StereoPannerNode extends AudioNode {
   readonly pan: AudioParam;
 }
 
-declare var StereoPannerNode: {
+declare const StereoPannerNode: {
   prototype: StereoPannerNode;
   new (
     context: BaseAudioContext,
@@ -34364,10 +34693,10 @@ interface Storage {
    * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/setItem)
    */
   setItem(key: string, value: string): void;
-  [name: string]: any;
+  [name: string]: unknown;
 }
 
-declare var Storage: {
+declare const Storage: {
   prototype: Storage;
   new (): Storage;
 };
@@ -34434,7 +34763,7 @@ interface StorageEvent extends Event {
   ): void;
 }
 
-declare var StorageEvent: {
+declare const StorageEvent: {
   prototype: StorageEvent;
   new (type: string, eventInitDict?: StorageEventInit): StorageEvent;
 };
@@ -34467,7 +34796,7 @@ interface StorageManager {
   persisted(): Promise<boolean>;
 }
 
-declare var StorageManager: {
+declare const StorageManager: {
   prototype: StorageManager;
   new (): StorageManager;
 };
@@ -34502,7 +34831,7 @@ interface StylePropertyMap extends StylePropertyMapReadOnly {
   set(property: string, ...values: (CSSStyleValue | string)[]): void;
 }
 
-declare var StylePropertyMap: {
+declare const StylePropertyMap: {
   prototype: StylePropertyMap;
   new (): StylePropertyMap;
 };
@@ -34526,7 +34855,7 @@ interface StylePropertyMapReadOnly {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/StylePropertyMapReadOnly/getAll)
    */
-  getAll(property: string): CSSStyleValue[];
+  getAll(property: string): readonly CSSStyleValue[];
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/StylePropertyMapReadOnly/has)
@@ -34534,15 +34863,15 @@ interface StylePropertyMapReadOnly {
   has(property: string): boolean;
   forEach(
     callbackfn: (
-      value: CSSStyleValue[],
+      value: readonly CSSStyleValue[],
       key: string,
       parent: StylePropertyMapReadOnly,
     ) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var StylePropertyMapReadOnly: {
+declare const StylePropertyMapReadOnly: {
   prototype: StylePropertyMapReadOnly;
   new (): StylePropertyMapReadOnly;
 };
@@ -34585,7 +34914,7 @@ interface StyleSheet {
   readonly type: string;
 }
 
-declare var StyleSheet: {
+declare const StyleSheet: {
   prototype: StyleSheet;
   new (): StyleSheet;
 };
@@ -34609,7 +34938,7 @@ interface StyleSheetList {
   [index: number]: CSSStyleSheet;
 }
 
-declare var StyleSheetList: {
+declare const StyleSheetList: {
   prototype: StyleSheetList;
   new (): StyleSheetList;
 };
@@ -34626,7 +34955,7 @@ interface SubmitEvent extends Event {
   readonly submitter: HTMLElement | null;
 }
 
-declare var SubmitEvent: {
+declare const SubmitEvent: {
   prototype: SubmitEvent;
   new (type: string, eventInitDict?: SubmitEventInit): SubmitEvent;
 };
@@ -34684,7 +35013,7 @@ interface SubtleCrypto {
       | HkdfParams
       | Pbkdf2Params,
     extractable: boolean,
-    keyUsages: KeyUsage[],
+    keyUsages: readonly KeyUsage[],
   ): Promise<CryptoKey>;
   /**
    * [MDN
@@ -34743,7 +35072,7 @@ interface SubtleCrypto {
   generateKey(
     algorithm: AlgorithmIdentifier,
     extractable: boolean,
-    keyUsages: KeyUsage[],
+    keyUsages: readonly KeyUsage[],
   ): Promise<CryptoKeyPair | CryptoKey>;
   /**
    * [MDN
@@ -34771,7 +35100,7 @@ interface SubtleCrypto {
       | HmacImportParams
       | AesKeyAlgorithm,
     extractable: boolean,
-    keyUsages: KeyUsage[],
+    keyUsages: readonly KeyUsage[],
   ): Promise<CryptoKey>;
   /**
    * [MDN
@@ -34803,7 +35132,7 @@ interface SubtleCrypto {
       | HmacImportParams
       | AesKeyAlgorithm,
     extractable: boolean,
-    keyUsages: KeyUsage[],
+    keyUsages: readonly KeyUsage[],
   ): Promise<CryptoKey>;
   /**
    * [MDN
@@ -34832,7 +35161,7 @@ interface SubtleCrypto {
   ): Promise<ArrayBuffer>;
 }
 
-declare var SubtleCrypto: {
+declare const SubtleCrypto: {
   prototype: SubtleCrypto;
   new (): SubtleCrypto;
 };
@@ -34860,7 +35189,7 @@ interface Text extends CharacterData, Slottable {
   splitText(offset: number): Text;
 }
 
-declare var Text: {
+declare const Text: {
   prototype: Text;
   new (data?: string): Text;
 };
@@ -34882,7 +35211,7 @@ interface TextDecoder extends TextDecoderCommon {
    * invocation without options's stream (or set to false) has no input, it's
    * clearest to omit both arguments.
    *
-   *     var string = '',
+   *     const string = '',
    *       decoder = new TextDecoder(encoding),
    *       buffer;
    *     while ((buffer = next_chunk())) {
@@ -34899,7 +35228,7 @@ interface TextDecoder extends TextDecoderCommon {
   decode(input?: AllowSharedBufferSource, options?: TextDecodeOptions): string;
 }
 
-declare var TextDecoder: {
+declare const TextDecoder: {
   prototype: TextDecoder;
   new (label?: string, options?: TextDecoderOptions): TextDecoder;
 };
@@ -34934,7 +35263,7 @@ interface TextDecoderStream extends GenericTransformStream, TextDecoderCommon {
   readonly writable: WritableStream<BufferSource>;
 }
 
-declare var TextDecoderStream: {
+declare const TextDecoderStream: {
   prototype: TextDecoderStream;
   new (label?: string, options?: TextDecoderOptions): TextDecoderStream;
 };
@@ -34969,7 +35298,7 @@ interface TextEncoder extends TextEncoderCommon {
   ): TextEncoderEncodeIntoResult;
 }
 
-declare var TextEncoder: {
+declare const TextEncoder: {
   prototype: TextEncoder;
   new (): TextEncoder;
 };
@@ -34990,7 +35319,7 @@ interface TextEncoderStream extends GenericTransformStream, TextEncoderCommon {
   readonly writable: WritableStream<string>;
 }
 
-declare var TextEncoderStream: {
+declare const TextEncoderStream: {
   prototype: TextEncoderStream;
   new (): TextEncoderStream;
 };
@@ -35088,7 +35417,7 @@ interface TextMetrics {
   readonly width: number;
 }
 
-declare var TextMetrics: {
+declare const TextMetrics: {
   prototype: TextMetrics;
   new (): TextMetrics;
 };
@@ -35173,7 +35502,7 @@ interface TextTrack extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TextTrack/cuechange_event)
    */
-  oncuechange: ((this: TextTrack, ev: Event) => any) | null;
+  oncuechange: ((this: TextTrack, ev: Event) => unknown) | null;
   /**
    * Adds the given cue to textTrack's text track list of cues.
    *
@@ -35190,7 +35519,7 @@ interface TextTrack extends EventTarget {
   removeCue(cue: TextTrackCue): void;
   addEventListener<K extends keyof TextTrackEventMap>(
     type: K,
-    listener: (this: TextTrack, ev: TextTrackEventMap[K]) => any,
+    listener: (this: TextTrack, ev: TextTrackEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -35200,7 +35529,7 @@ interface TextTrack extends EventTarget {
   ): void;
   removeEventListener<K extends keyof TextTrackEventMap>(
     type: K,
-    listener: (this: TextTrack, ev: TextTrackEventMap[K]) => any,
+    listener: (this: TextTrack, ev: TextTrackEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -35210,7 +35539,7 @@ interface TextTrack extends EventTarget {
   ): void;
 }
 
-declare var TextTrack: {
+declare const TextTrack: {
   prototype: TextTrack;
   new (): TextTrack;
 };
@@ -35250,12 +35579,12 @@ interface TextTrackCue extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TextTrackCue/enter_event)
    */
-  onenter: ((this: TextTrackCue, ev: Event) => any) | null;
+  onenter: ((this: TextTrackCue, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TextTrackCue/exit_event)
    */
-  onexit: ((this: TextTrackCue, ev: Event) => any) | null;
+  onexit: ((this: TextTrackCue, ev: Event) => unknown) | null;
   /**
    * Returns true if the text track cue pause-on-exit flag is set, false
    * otherwise.
@@ -35285,7 +35614,7 @@ interface TextTrackCue extends EventTarget {
   readonly track: TextTrack | null;
   addEventListener<K extends keyof TextTrackCueEventMap>(
     type: K,
-    listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K]) => any,
+    listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -35295,7 +35624,7 @@ interface TextTrackCue extends EventTarget {
   ): void;
   removeEventListener<K extends keyof TextTrackCueEventMap>(
     type: K,
-    listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K]) => any,
+    listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -35305,7 +35634,7 @@ interface TextTrackCue extends EventTarget {
   ): void;
 }
 
-declare var TextTrackCue: {
+declare const TextTrackCue: {
   prototype: TextTrackCue;
   new (): TextTrackCue;
 };
@@ -35333,7 +35662,7 @@ interface TextTrackCueList {
   [index: number]: TextTrackCue;
 }
 
-declare var TextTrackCueList: {
+declare const TextTrackCueList: {
   prototype: TextTrackCueList;
   new (): TextTrackCueList;
 };
@@ -35355,17 +35684,17 @@ interface TextTrackList extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TextTrackList/addtrack_event)
    */
-  onaddtrack: ((this: TextTrackList, ev: TrackEvent) => any) | null;
+  onaddtrack: ((this: TextTrackList, ev: TrackEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TextTrackList/change_event)
    */
-  onchange: ((this: TextTrackList, ev: Event) => any) | null;
+  onchange: ((this: TextTrackList, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TextTrackList/removetrack_event)
    */
-  onremovetrack: ((this: TextTrackList, ev: TrackEvent) => any) | null;
+  onremovetrack: ((this: TextTrackList, ev: TrackEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TextTrackList/getTrackById)
@@ -35373,7 +35702,7 @@ interface TextTrackList extends EventTarget {
   getTrackById(id: string): TextTrack | null;
   addEventListener<K extends keyof TextTrackListEventMap>(
     type: K,
-    listener: (this: TextTrackList, ev: TextTrackListEventMap[K]) => any,
+    listener: (this: TextTrackList, ev: TextTrackListEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -35383,7 +35712,7 @@ interface TextTrackList extends EventTarget {
   ): void;
   removeEventListener<K extends keyof TextTrackListEventMap>(
     type: K,
-    listener: (this: TextTrackList, ev: TextTrackListEventMap[K]) => any,
+    listener: (this: TextTrackList, ev: TextTrackListEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -35394,7 +35723,7 @@ interface TextTrackList extends EventTarget {
   [index: number]: TextTrack;
 }
 
-declare var TextTrackList: {
+declare const TextTrackList: {
   prototype: TextTrackList;
   new (): TextTrackList;
 };
@@ -35433,7 +35762,7 @@ interface TimeRanges {
   start(index: number): number;
 }
 
-declare var TimeRanges: {
+declare const TimeRanges: {
   prototype: TimeRanges;
   new (): TimeRanges;
 };
@@ -35452,7 +35781,7 @@ interface ToggleEvent extends Event {
   readonly oldState: string;
 }
 
-declare var ToggleEvent: {
+declare const ToggleEvent: {
   prototype: ToggleEvent;
   new (type: string, eventInitDict?: ToggleEventInit): ToggleEvent;
 };
@@ -35496,7 +35825,7 @@ interface Touch {
   readonly target: EventTarget;
 }
 
-declare var Touch: {
+declare const Touch: {
   prototype: Touch;
   new (touchInitDict: TouchInit): Touch;
 };
@@ -35548,7 +35877,7 @@ interface TouchEvent extends UIEvent {
   readonly touches: TouchList;
 }
 
-declare var TouchEvent: {
+declare const TouchEvent: {
   prototype: TouchEvent;
   new (type: string, eventInitDict?: TouchEventInit): TouchEvent;
 };
@@ -35572,7 +35901,7 @@ interface TouchList {
   [index: number]: Touch;
 }
 
-declare var TouchList: {
+declare const TouchList: {
   prototype: TouchList;
   new (): TouchList;
 };
@@ -35595,13 +35924,13 @@ interface TrackEvent extends Event {
   readonly track: TextTrack | null;
 }
 
-declare var TrackEvent: {
+declare const TrackEvent: {
   prototype: TrackEvent;
   new (type: string, eventInitDict?: TrackEventInit): TrackEvent;
 };
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStream) */
-interface TransformStream<I = any, O = any> {
+interface TransformStream<I = unknown, O = unknown> {
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TransformStream/readable)
@@ -35614,9 +35943,9 @@ interface TransformStream<I = any, O = any> {
   readonly writable: WritableStream<I>;
 }
 
-declare var TransformStream: {
+declare const TransformStream: {
   prototype: TransformStream;
-  new <I = any, O = any>(
+  new <I = unknown, O = unknown>(
     transformer?: Transformer<I, O>,
     writableStrategy?: QueuingStrategy<I>,
     readableStrategy?: QueuingStrategy<O>,
@@ -35627,7 +35956,7 @@ declare var TransformStream: {
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController)
  */
-interface TransformStreamDefaultController<O = any> {
+interface TransformStreamDefaultController<O = unknown> {
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController/desiredSize)
@@ -35642,7 +35971,7 @@ interface TransformStreamDefaultController<O = any> {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController/error)
    */
-  error(reason?: any): void;
+  error(reason?: unknown): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController/terminate)
@@ -35650,7 +35979,7 @@ interface TransformStreamDefaultController<O = any> {
   terminate(): void;
 }
 
-declare var TransformStreamDefaultController: {
+declare const TransformStreamDefaultController: {
   prototype: TransformStreamDefaultController;
   new (): TransformStreamDefaultController;
 };
@@ -35678,7 +36007,7 @@ interface TransitionEvent extends Event {
   readonly pseudoElement: string;
 }
 
-declare var TransitionEvent: {
+declare const TransitionEvent: {
   prototype: TransitionEvent;
   new (
     type: string,
@@ -35746,7 +36075,7 @@ interface TreeWalker {
   previousSibling(): Node | null;
 }
 
-declare var TreeWalker: {
+declare const TreeWalker: {
   prototype: TreeWalker;
   new (): TreeWalker;
 };
@@ -35782,7 +36111,7 @@ interface UIEvent extends Event {
   ): void;
 }
 
-declare var UIEvent: {
+declare const UIEvent: {
   prototype: UIEvent;
   new (type: string, eventInitDict?: UIEventInit): UIEvent;
 };
@@ -35826,7 +36155,7 @@ interface URL {
   toJSON(): string;
 }
 
-declare var URL: {
+declare const URL: {
   prototype: URL;
   new (url: string | URL, base?: string | URL): URL;
   /**
@@ -35847,7 +36176,7 @@ declare var URL: {
 };
 
 type webkitURL = URL;
-declare var webkitURL: typeof URL;
+declare const webkitURL: typeof URL;
 
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams) */
 interface URLSearchParams {
@@ -35884,7 +36213,7 @@ interface URLSearchParams {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/getAll)
    */
-  getAll(name: string): string[];
+  getAll(name: string): readonly string[];
   /**
    * Returns a Boolean indicating if such a search parameter exists.
    *
@@ -35912,14 +36241,18 @@ interface URLSearchParams {
   toString(): string;
   forEach(
     callbackfn: (value: string, key: string, parent: URLSearchParams) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
 }
 
-declare var URLSearchParams: {
+declare const URLSearchParams: {
   prototype: URLSearchParams;
   new (
-    init?: string[][] | Record<string, string> | string | URLSearchParams,
+    init?:
+      | readonly (readonly string[])[]
+      | Record<string, string>
+      | string
+      | URLSearchParams,
   ): URLSearchParams;
 };
 
@@ -35937,7 +36270,7 @@ interface UserActivation {
   readonly isActive: boolean;
 }
 
-declare var UserActivation: {
+declare const UserActivation: {
   prototype: UserActivation;
   new (): UserActivation;
 };
@@ -35980,7 +36313,7 @@ interface VTTCue extends TextTrackCue {
   getCueAsHTML(): DocumentFragment;
   addEventListener<K extends keyof TextTrackCueEventMap>(
     type: K,
-    listener: (this: VTTCue, ev: TextTrackCueEventMap[K]) => any,
+    listener: (this: VTTCue, ev: TextTrackCueEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -35990,7 +36323,7 @@ interface VTTCue extends TextTrackCue {
   ): void;
   removeEventListener<K extends keyof TextTrackCueEventMap>(
     type: K,
-    listener: (this: VTTCue, ev: TextTrackCueEventMap[K]) => any,
+    listener: (this: VTTCue, ev: TextTrackCueEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -36000,7 +36333,7 @@ interface VTTCue extends TextTrackCue {
   ): void;
 }
 
-declare var VTTCue: {
+declare const VTTCue: {
   prototype: VTTCue;
   new (startTime: number, endTime: number, text: string): VTTCue;
 };
@@ -36040,7 +36373,7 @@ interface VTTRegion {
   width: number;
 }
 
-declare var VTTRegion: {
+declare const VTTRegion: {
   prototype: VTTRegion;
   new (): VTTRegion;
 };
@@ -36110,7 +36443,7 @@ interface ValidityState {
   readonly valueMissing: boolean;
 }
 
-declare var ValidityState: {
+declare const ValidityState: {
   prototype: ValidityState;
   new (): ValidityState;
 };
@@ -36144,7 +36477,7 @@ interface VideoColorSpace {
   toJSON(): VideoColorSpaceInit;
 }
 
-declare var VideoColorSpace: {
+declare const VideoColorSpace: {
   prototype: VideoColorSpace;
   new (init?: VideoColorSpaceInit): VideoColorSpace;
 };
@@ -36164,7 +36497,7 @@ interface VideoDecoder extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/VideoDecoder/decodeQueueSize)
    */
   readonly decodeQueueSize: number;
-  ondequeue: ((this: VideoDecoder, ev: Event) => any) | null;
+  ondequeue: ((this: VideoDecoder, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/VideoDecoder/state)
@@ -36197,7 +36530,7 @@ interface VideoDecoder extends EventTarget {
   reset(): void;
   addEventListener<K extends keyof VideoDecoderEventMap>(
     type: K,
-    listener: (this: VideoDecoder, ev: VideoDecoderEventMap[K]) => any,
+    listener: (this: VideoDecoder, ev: VideoDecoderEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -36207,7 +36540,7 @@ interface VideoDecoder extends EventTarget {
   ): void;
   removeEventListener<K extends keyof VideoDecoderEventMap>(
     type: K,
-    listener: (this: VideoDecoder, ev: VideoDecoderEventMap[K]) => any,
+    listener: (this: VideoDecoder, ev: VideoDecoderEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -36217,7 +36550,7 @@ interface VideoDecoder extends EventTarget {
   ): void;
 }
 
-declare var VideoDecoder: {
+declare const VideoDecoder: {
   prototype: VideoDecoder;
   new (init: VideoDecoderInit): VideoDecoder;
   isConfigSupported(config: VideoDecoderConfig): Promise<VideoDecoderSupport>;
@@ -36238,7 +36571,7 @@ interface VideoEncoder extends EventTarget {
    * Reference](https://developer.mozilla.org/docs/Web/API/VideoEncoder/encodeQueueSize)
    */
   readonly encodeQueueSize: number;
-  ondequeue: ((this: VideoEncoder, ev: Event) => any) | null;
+  ondequeue: ((this: VideoEncoder, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/VideoEncoder/state)
@@ -36267,7 +36600,7 @@ interface VideoEncoder extends EventTarget {
   reset(): void;
   addEventListener<K extends keyof VideoEncoderEventMap>(
     type: K,
-    listener: (this: VideoEncoder, ev: VideoEncoderEventMap[K]) => any,
+    listener: (this: VideoEncoder, ev: VideoEncoderEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -36277,7 +36610,7 @@ interface VideoEncoder extends EventTarget {
   ): void;
   removeEventListener<K extends keyof VideoEncoderEventMap>(
     type: K,
-    listener: (this: VideoEncoder, ev: VideoEncoderEventMap[K]) => any,
+    listener: (this: VideoEncoder, ev: VideoEncoderEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -36287,7 +36620,7 @@ interface VideoEncoder extends EventTarget {
   ): void;
 }
 
-declare var VideoEncoder: {
+declare const VideoEncoder: {
   prototype: VideoEncoder;
   new (init: VideoEncoderInit): VideoEncoder;
   isConfigSupported(config: VideoEncoderConfig): Promise<VideoEncoderSupport>;
@@ -36363,10 +36696,10 @@ interface VideoFrame {
   copyTo(
     destination: AllowSharedBufferSource,
     options?: VideoFrameCopyToOptions,
-  ): Promise<PlaneLayout[]>;
+  ): Promise<readonly PlaneLayout[]>;
 }
 
-declare var VideoFrame: {
+declare const VideoFrame: {
   prototype: VideoFrame;
   new (image: CanvasImageSource, init?: VideoFrameInit): VideoFrame;
   new (data: AllowSharedBufferSource, init: VideoFrameBufferInit): VideoFrame;
@@ -36405,7 +36738,7 @@ interface VideoPlaybackQuality {
   readonly totalVideoFrames: number;
 }
 
-declare var VideoPlaybackQuality: {
+declare const VideoPlaybackQuality: {
   prototype: VideoPlaybackQuality;
   new (): VideoPlaybackQuality;
 };
@@ -36436,12 +36769,12 @@ interface VisualViewport extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/VisualViewport/resize_event)
    */
-  onresize: ((this: VisualViewport, ev: Event) => any) | null;
+  onresize: ((this: VisualViewport, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/VisualViewport/scroll_event)
    */
-  onscroll: ((this: VisualViewport, ev: Event) => any) | null;
+  onscroll: ((this: VisualViewport, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/VisualViewport/pageLeft)
@@ -36464,7 +36797,7 @@ interface VisualViewport extends EventTarget {
   readonly width: number;
   addEventListener<K extends keyof VisualViewportEventMap>(
     type: K,
-    listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => any,
+    listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -36474,7 +36807,7 @@ interface VisualViewport extends EventTarget {
   ): void;
   removeEventListener<K extends keyof VisualViewportEventMap>(
     type: K,
-    listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => any,
+    listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -36484,7 +36817,7 @@ interface VisualViewport extends EventTarget {
   ): void;
 }
 
-declare var VisualViewport: {
+declare const VisualViewport: {
   prototype: VisualViewport;
   new (): VisualViewport;
 };
@@ -36508,7 +36841,7 @@ interface WEBGL_compressed_texture_astc {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WEBGL_compressed_texture_astc/getSupportedProfiles)
    */
-  getSupportedProfiles(): string[];
+  getSupportedProfiles(): readonly string[];
   readonly COMPRESSED_RGBA_ASTC_4x4_KHR: 0x93b0;
   readonly COMPRESSED_RGBA_ASTC_5x4_KHR: 0x93b1;
   readonly COMPRESSED_RGBA_ASTC_5x5_KHR: 0x93b2;
@@ -36645,7 +36978,7 @@ interface WEBGL_draw_buffers {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WEBGL_draw_buffers/drawBuffersWEBGL)
    */
-  drawBuffersWEBGL(buffers: GLenum[]): void;
+  drawBuffersWEBGL(buffers: readonly GLenum[]): void;
   readonly COLOR_ATTACHMENT0_WEBGL: 0x8ce0;
   readonly COLOR_ATTACHMENT1_WEBGL: 0x8ce1;
   readonly COLOR_ATTACHMENT2_WEBGL: 0x8ce2;
@@ -36707,11 +37040,11 @@ interface WEBGL_multi_draw {
    */
   multiDrawArraysInstancedWEBGL(
     mode: GLenum,
-    firstsList: Int32Array | GLint[],
+    firstsList: Int32Array | readonly GLint[],
     firstsOffset: number,
-    countsList: Int32Array | GLsizei[],
+    countsList: Int32Array | readonly GLsizei[],
     countsOffset: number,
-    instanceCountsList: Int32Array | GLsizei[],
+    instanceCountsList: Int32Array | readonly GLsizei[],
     instanceCountsOffset: number,
     drawcount: GLsizei,
   ): void;
@@ -36721,9 +37054,9 @@ interface WEBGL_multi_draw {
    */
   multiDrawArraysWEBGL(
     mode: GLenum,
-    firstsList: Int32Array | GLint[],
+    firstsList: Int32Array | readonly GLint[],
     firstsOffset: number,
-    countsList: Int32Array | GLsizei[],
+    countsList: Int32Array | readonly GLsizei[],
     countsOffset: number,
     drawcount: GLsizei,
   ): void;
@@ -36733,12 +37066,12 @@ interface WEBGL_multi_draw {
    */
   multiDrawElementsInstancedWEBGL(
     mode: GLenum,
-    countsList: Int32Array | GLsizei[],
+    countsList: Int32Array | readonly GLsizei[],
     countsOffset: number,
     type: GLenum,
-    offsetsList: Int32Array | GLsizei[],
+    offsetsList: Int32Array | readonly GLsizei[],
     offsetsOffset: number,
-    instanceCountsList: Int32Array | GLsizei[],
+    instanceCountsList: Int32Array | readonly GLsizei[],
     instanceCountsOffset: number,
     drawcount: GLsizei,
   ): void;
@@ -36748,10 +37081,10 @@ interface WEBGL_multi_draw {
    */
   multiDrawElementsWEBGL(
     mode: GLenum,
-    countsList: Int32Array | GLsizei[],
+    countsList: Int32Array | readonly GLsizei[],
     countsOffset: number,
     type: GLenum,
-    offsetsList: Int32Array | GLsizei[],
+    offsetsList: Int32Array | readonly GLsizei[],
     offsetsOffset: number,
     drawcount: GLsizei,
   ): void;
@@ -36770,7 +37103,7 @@ interface WakeLock {
   request(type?: WakeLockType): Promise<WakeLockSentinel>;
 }
 
-declare var WakeLock: {
+declare const WakeLock: {
   prototype: WakeLock;
   new (): WakeLock;
 };
@@ -36789,7 +37122,7 @@ interface WakeLockSentinel extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WakeLockSentinel/release_event)
    */
-  onrelease: ((this: WakeLockSentinel, ev: Event) => any) | null;
+  onrelease: ((this: WakeLockSentinel, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WakeLockSentinel/released)
@@ -36807,7 +37140,10 @@ interface WakeLockSentinel extends EventTarget {
   release(): Promise<void>;
   addEventListener<K extends keyof WakeLockSentinelEventMap>(
     type: K,
-    listener: (this: WakeLockSentinel, ev: WakeLockSentinelEventMap[K]) => any,
+    listener: (
+      this: WakeLockSentinel,
+      ev: WakeLockSentinelEventMap[K],
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -36817,7 +37153,10 @@ interface WakeLockSentinel extends EventTarget {
   ): void;
   removeEventListener<K extends keyof WakeLockSentinelEventMap>(
     type: K,
-    listener: (this: WakeLockSentinel, ev: WakeLockSentinelEventMap[K]) => any,
+    listener: (
+      this: WakeLockSentinel,
+      ev: WakeLockSentinelEventMap[K],
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -36827,7 +37166,7 @@ interface WakeLockSentinel extends EventTarget {
   ): void;
 }
 
-declare var WakeLockSentinel: {
+declare const WakeLockSentinel: {
   prototype: WakeLockSentinel;
   new (): WakeLockSentinel;
 };
@@ -36850,7 +37189,7 @@ interface WaveShaperNode extends AudioNode {
   oversample: OverSampleType;
 }
 
-declare var WaveShaperNode: {
+declare const WaveShaperNode: {
   prototype: WaveShaperNode;
   new (context: BaseAudioContext, options?: WaveShaperOptions): WaveShaperNode;
 };
@@ -36864,7 +37203,7 @@ interface WebGL2RenderingContext
     WebGL2RenderingContextOverloads,
     WebGLRenderingContextBase {}
 
-declare var WebGL2RenderingContext: {
+declare const WebGL2RenderingContext: {
   prototype: WebGL2RenderingContext;
   new (): WebGL2RenderingContext;
   readonly READ_BUFFER: 0x0c02;
@@ -37681,7 +38020,7 @@ interface WebGL2RenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/drawBuffers)
    */
-  drawBuffers(buffers: GLenum[]): void;
+  drawBuffers(buffers: readonly GLenum[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/drawElementsInstanced)
@@ -37747,16 +38086,16 @@ interface WebGL2RenderingContextBase {
     program: WebGLProgram,
     uniformBlockIndex: GLuint,
     pname: GLenum,
-  ): any;
+  ): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getActiveUniforms)
    */
   getActiveUniforms(
     program: WebGLProgram,
-    uniformIndices: GLuint[],
+    uniformIndices: readonly GLuint[],
     pname: GLenum,
-  ): any;
+  ): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getBufferSubData)
@@ -37777,7 +38116,7 @@ interface WebGL2RenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getIndexedParameter)
    */
-  getIndexedParameter(target: GLenum, index: GLuint): any;
+  getIndexedParameter(target: GLenum, index: GLuint): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getInternalformatParameter)
@@ -37786,7 +38125,7 @@ interface WebGL2RenderingContextBase {
     target: GLenum,
     internalformat: GLenum,
     pname: GLenum,
-  ): any;
+  ): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getQuery)
@@ -37796,17 +38135,17 @@ interface WebGL2RenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getQueryParameter)
    */
-  getQueryParameter(query: WebGLQuery, pname: GLenum): any;
+  getQueryParameter(query: WebGLQuery, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getSamplerParameter)
    */
-  getSamplerParameter(sampler: WebGLSampler, pname: GLenum): any;
+  getSamplerParameter(sampler: WebGLSampler, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getSyncParameter)
    */
-  getSyncParameter(sync: WebGLSync, pname: GLenum): any;
+  getSyncParameter(sync: WebGLSync, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getTransformFeedbackVarying)
@@ -37826,20 +38165,20 @@ interface WebGL2RenderingContextBase {
    */
   getUniformIndices(
     program: WebGLProgram,
-    uniformNames: string[],
-  ): GLuint[] | null;
+    uniformNames: readonly string[],
+  ): readonly GLuint[] | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/invalidateFramebuffer)
    */
-  invalidateFramebuffer(target: GLenum, attachments: GLenum[]): void;
+  invalidateFramebuffer(target: GLenum, attachments: readonly GLenum[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/invalidateSubFramebuffer)
    */
   invalidateSubFramebuffer(
     target: GLenum,
-    attachments: GLenum[],
+    attachments: readonly GLenum[],
     x: GLint,
     y: GLint,
     width: GLsizei,
@@ -38032,7 +38371,7 @@ interface WebGL2RenderingContextBase {
    */
   transformFeedbackVaryings(
     program: WebGLProgram,
-    varyings: string[],
+    varyings: readonly string[],
     bufferMode: GLenum,
   ): void;
   /**
@@ -38869,7 +39208,7 @@ interface WebGLActiveInfo {
   readonly type: GLenum;
 }
 
-declare var WebGLActiveInfo: {
+declare const WebGLActiveInfo: {
   prototype: WebGLActiveInfo;
   new (): WebGLActiveInfo;
 };
@@ -38882,7 +39221,7 @@ declare var WebGLActiveInfo: {
  */
 interface WebGLBuffer {}
 
-declare var WebGLBuffer: {
+declare const WebGLBuffer: {
   prototype: WebGLBuffer;
   new (): WebGLBuffer;
 };
@@ -38902,7 +39241,7 @@ interface WebGLContextEvent extends Event {
   readonly statusMessage: string;
 }
 
-declare var WebGLContextEvent: {
+declare const WebGLContextEvent: {
   prototype: WebGLContextEvent;
   new (type: string, eventInit?: WebGLContextEventInit): WebGLContextEvent;
 };
@@ -38915,7 +39254,7 @@ declare var WebGLContextEvent: {
  */
 interface WebGLFramebuffer {}
 
-declare var WebGLFramebuffer: {
+declare const WebGLFramebuffer: {
   prototype: WebGLFramebuffer;
   new (): WebGLFramebuffer;
 };
@@ -38929,7 +39268,7 @@ declare var WebGLFramebuffer: {
  */
 interface WebGLProgram {}
 
-declare var WebGLProgram: {
+declare const WebGLProgram: {
   prototype: WebGLProgram;
   new (): WebGLProgram;
 };
@@ -38937,7 +39276,7 @@ declare var WebGLProgram: {
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebGLQuery) */
 interface WebGLQuery {}
 
-declare var WebGLQuery: {
+declare const WebGLQuery: {
   prototype: WebGLQuery;
   new (): WebGLQuery;
 };
@@ -38950,7 +39289,7 @@ declare var WebGLQuery: {
  */
 interface WebGLRenderbuffer {}
 
-declare var WebGLRenderbuffer: {
+declare const WebGLRenderbuffer: {
   prototype: WebGLRenderbuffer;
   new (): WebGLRenderbuffer;
 };
@@ -38966,7 +39305,7 @@ interface WebGLRenderingContext
   extends WebGLRenderingContextBase,
     WebGLRenderingContextOverloads {}
 
-declare var WebGLRenderingContext: {
+declare const WebGLRenderingContext: {
   prototype: WebGLRenderingContext;
   new (): WebGLRenderingContext;
   readonly DEPTH_BUFFER_BIT: 0x00000100;
@@ -39609,7 +39948,7 @@ interface WebGLRenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getAttachedShaders)
    */
-  getAttachedShaders(program: WebGLProgram): WebGLShader[] | null;
+  getAttachedShaders(program: WebGLProgram): readonly WebGLShader[] | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getAttribLocation)
@@ -39619,7 +39958,7 @@ interface WebGLRenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getBufferParameter)
    */
-  getBufferParameter(target: GLenum, pname: GLenum): any;
+  getBufferParameter(target: GLenum, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getContextAttributes)
@@ -39718,7 +40057,7 @@ interface WebGLRenderingContextBase {
   getExtension(extensionName: 'WEBGL_draw_buffers'): WEBGL_draw_buffers | null;
   getExtension(extensionName: 'WEBGL_lose_context'): WEBGL_lose_context | null;
   getExtension(extensionName: 'WEBGL_multi_draw'): WEBGL_multi_draw | null;
-  getExtension(name: string): any;
+  getExtension(name: string): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getFramebufferAttachmentParameter)
@@ -39727,12 +40066,12 @@ interface WebGLRenderingContextBase {
     target: GLenum,
     attachment: GLenum,
     pname: GLenum,
-  ): any;
+  ): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getParameter)
    */
-  getParameter(pname: GLenum): any;
+  getParameter(pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getProgramInfoLog)
@@ -39742,12 +40081,12 @@ interface WebGLRenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getProgramParameter)
    */
-  getProgramParameter(program: WebGLProgram, pname: GLenum): any;
+  getProgramParameter(program: WebGLProgram, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getRenderbufferParameter)
    */
-  getRenderbufferParameter(target: GLenum, pname: GLenum): any;
+  getRenderbufferParameter(target: GLenum, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getShaderInfoLog)
@@ -39757,7 +40096,7 @@ interface WebGLRenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getShaderParameter)
    */
-  getShaderParameter(shader: WebGLShader, pname: GLenum): any;
+  getShaderParameter(shader: WebGLShader, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getShaderPrecisionFormat)
@@ -39775,17 +40114,17 @@ interface WebGLRenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getSupportedExtensions)
    */
-  getSupportedExtensions(): string[] | null;
+  getSupportedExtensions(): readonly string[] | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getTexParameter)
    */
-  getTexParameter(target: GLenum, pname: GLenum): any;
+  getTexParameter(target: GLenum, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getUniform)
    */
-  getUniform(program: WebGLProgram, location: WebGLUniformLocation): any;
+  getUniform(program: WebGLProgram, location: WebGLUniformLocation): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getUniformLocation)
@@ -39798,7 +40137,7 @@ interface WebGLRenderingContextBase {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getVertexAttrib)
    */
-  getVertexAttrib(index: GLuint, pname: GLenum): any;
+  getVertexAttrib(index: GLuint, pname: GLenum): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/getVertexAttribOffset)
@@ -40557,7 +40896,7 @@ interface WebGLRenderingContextOverloads {
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebGLSampler) */
 interface WebGLSampler {}
 
-declare var WebGLSampler: {
+declare const WebGLSampler: {
   prototype: WebGLSampler;
   new (): WebGLSampler;
 };
@@ -40570,7 +40909,7 @@ declare var WebGLSampler: {
  */
 interface WebGLShader {}
 
-declare var WebGLShader: {
+declare const WebGLShader: {
   prototype: WebGLShader;
   new (): WebGLShader;
 };
@@ -40600,7 +40939,7 @@ interface WebGLShaderPrecisionFormat {
   readonly rangeMin: GLint;
 }
 
-declare var WebGLShaderPrecisionFormat: {
+declare const WebGLShaderPrecisionFormat: {
   prototype: WebGLShaderPrecisionFormat;
   new (): WebGLShaderPrecisionFormat;
 };
@@ -40608,7 +40947,7 @@ declare var WebGLShaderPrecisionFormat: {
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebGLSync) */
 interface WebGLSync {}
 
-declare var WebGLSync: {
+declare const WebGLSync: {
   prototype: WebGLSync;
   new (): WebGLSync;
 };
@@ -40621,7 +40960,7 @@ declare var WebGLSync: {
  */
 interface WebGLTexture {}
 
-declare var WebGLTexture: {
+declare const WebGLTexture: {
   prototype: WebGLTexture;
   new (): WebGLTexture;
 };
@@ -40632,7 +40971,7 @@ declare var WebGLTexture: {
  */
 interface WebGLTransformFeedback {}
 
-declare var WebGLTransformFeedback: {
+declare const WebGLTransformFeedback: {
   prototype: WebGLTransformFeedback;
   new (): WebGLTransformFeedback;
 };
@@ -40646,7 +40985,7 @@ declare var WebGLTransformFeedback: {
  */
 interface WebGLUniformLocation {}
 
-declare var WebGLUniformLocation: {
+declare const WebGLUniformLocation: {
   prototype: WebGLUniformLocation;
   new (): WebGLUniformLocation;
 };
@@ -40657,7 +40996,7 @@ declare var WebGLUniformLocation: {
  */
 interface WebGLVertexArrayObject {}
 
-declare var WebGLVertexArrayObject: {
+declare const WebGLVertexArrayObject: {
   prototype: WebGLVertexArrayObject;
   new (): WebGLVertexArrayObject;
 };
@@ -40716,22 +41055,22 @@ interface WebSocket extends EventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/close_event)
    */
-  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null;
+  onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/error_event)
    */
-  onerror: ((this: WebSocket, ev: Event) => any) | null;
+  onerror: ((this: WebSocket, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/message_event)
    */
-  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null;
+  onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/open_event)
    */
-  onopen: ((this: WebSocket, ev: Event) => any) | null;
+  onopen: ((this: WebSocket, ev: Event) => unknown) | null;
   /**
    * Returns the subprotocol selected by the server, if any. It can be used in
    * conjunction with the array form of the constructor's second argument to
@@ -40776,7 +41115,7 @@ interface WebSocket extends EventTarget {
   readonly CLOSED: 3;
   addEventListener<K extends keyof WebSocketEventMap>(
     type: K,
-    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
+    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -40786,7 +41125,7 @@ interface WebSocket extends EventTarget {
   ): void;
   removeEventListener<K extends keyof WebSocketEventMap>(
     type: K,
-    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
+    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -40796,9 +41135,9 @@ interface WebSocket extends EventTarget {
   ): void;
 }
 
-declare var WebSocket: {
+declare const WebSocket: {
   prototype: WebSocket;
-  new (url: string | URL, protocols?: string | string[]): WebSocket;
+  new (url: string | URL, protocols?: string | readonly string[]): WebSocket;
   readonly CONNECTING: 0;
   readonly OPEN: 1;
   readonly CLOSING: 2;
@@ -40857,7 +41196,7 @@ interface WebTransport {
   ): Promise<WritableStream>;
 }
 
-declare var WebTransport: {
+declare const WebTransport: {
   prototype: WebTransport;
   new (url: string | URL, options?: WebTransportOptions): WebTransport;
 };
@@ -40881,7 +41220,7 @@ interface WebTransportBidirectionalStream {
   readonly writable: WritableStream;
 }
 
-declare var WebTransportBidirectionalStream: {
+declare const WebTransportBidirectionalStream: {
   prototype: WebTransportBidirectionalStream;
   new (): WebTransportBidirectionalStream;
 };
@@ -40930,7 +41269,7 @@ interface WebTransportDatagramDuplexStream {
   readonly writable: WritableStream;
 }
 
-declare var WebTransportDatagramDuplexStream: {
+declare const WebTransportDatagramDuplexStream: {
   prototype: WebTransportDatagramDuplexStream;
   new (): WebTransportDatagramDuplexStream;
 };
@@ -40953,7 +41292,7 @@ interface WebTransportError extends DOMException {
   readonly streamErrorCode: number | null;
 }
 
-declare var WebTransportError: {
+declare const WebTransportError: {
   prototype: WebTransportError;
   new (message?: string, options?: WebTransportErrorOptions): WebTransportError;
 };
@@ -40990,7 +41329,7 @@ interface WheelEvent extends MouseEvent {
   readonly DOM_DELTA_PAGE: 0x02;
 }
 
-declare var WheelEvent: {
+declare const WheelEvent: {
   prototype: WheelEvent;
   new (type: string, eventInitDict?: WheelEventInit): WheelEvent;
   readonly DOM_DELTA_PIXEL: 0x00;
@@ -41114,7 +41453,7 @@ interface Window
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/devicemotion_event)
    */
-  ondevicemotion: ((this: Window, ev: DeviceMotionEvent) => any) | null;
+  ondevicemotion: ((this: Window, ev: DeviceMotionEvent) => unknown) | null;
   /**
    * Available only in secure contexts.
    *
@@ -41122,7 +41461,7 @@ interface Window
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/deviceorientation_event)
    */
   ondeviceorientation:
-    | ((this: Window, ev: DeviceOrientationEvent) => any)
+    | ((this: Window, ev: DeviceOrientationEvent) => unknown)
     | null;
   /**
    * Available only in secure contexts.
@@ -41131,7 +41470,7 @@ interface Window
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/deviceorientationabsolute_event)
    */
   ondeviceorientationabsolute:
-    | ((this: Window, ev: DeviceOrientationEvent) => any)
+    | ((this: Window, ev: DeviceOrientationEvent) => unknown)
     | null;
   /**
    * @deprecated
@@ -41139,9 +41478,9 @@ interface Window
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Window/orientationchange_event)
    */
-  onorientationchange: ((this: Window, ev: Event) => any) | null;
+  onorientationchange: ((this: Window, ev: Event) => unknown) | null;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/opener) */
-  opener: any;
+  opener: unknown;
   /**
    * @deprecated
    *
@@ -41250,7 +41589,7 @@ interface Window
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/window) */
   readonly window: Window & typeof globalThis;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/alert) */
-  alert(message?: any): void;
+  alert(message?: unknown): void;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/blur) */
   blur(): void;
   /**
@@ -41331,11 +41670,11 @@ interface Window
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/postMessage)
    */
   postMessage(
-    message: any,
+    message: unknown,
     targetOrigin: string,
-    transfer?: Transferable[],
+    transfer?: readonly Transferable[],
   ): void;
-  postMessage(message: any, options?: WindowPostMessageOptions): void;
+  postMessage(message: unknown, options?: WindowPostMessageOptions): void;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/print) */
   print(): void;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/prompt) */
@@ -41376,7 +41715,7 @@ interface Window
   stop(): void;
   addEventListener<K extends keyof WindowEventMap>(
     type: K,
-    listener: (this: Window, ev: WindowEventMap[K]) => any,
+    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -41386,7 +41725,7 @@ interface Window
   ): void;
   removeEventListener<K extends keyof WindowEventMap>(
     type: K,
-    listener: (this: Window, ev: WindowEventMap[K]) => any,
+    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -41397,7 +41736,7 @@ interface Window
   [index: number]: Window;
 }
 
-declare var Window: {
+declare const Window: {
   prototype: Window;
   new (): Window;
 };
@@ -41428,102 +41767,106 @@ interface WindowEventHandlers {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/afterprint_event)
    */
-  onafterprint: ((this: WindowEventHandlers, ev: Event) => any) | null;
+  onafterprint: ((this: WindowEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/beforeprint_event)
    */
-  onbeforeprint: ((this: WindowEventHandlers, ev: Event) => any) | null;
+  onbeforeprint: ((this: WindowEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/beforeunload_event)
    */
   onbeforeunload:
-    | ((this: WindowEventHandlers, ev: BeforeUnloadEvent) => any)
+    | ((this: WindowEventHandlers, ev: BeforeUnloadEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/gamepadconnected_event)
    */
   ongamepadconnected:
-    | ((this: WindowEventHandlers, ev: GamepadEvent) => any)
+    | ((this: WindowEventHandlers, ev: GamepadEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/gamepaddisconnected_event)
    */
   ongamepaddisconnected:
-    | ((this: WindowEventHandlers, ev: GamepadEvent) => any)
+    | ((this: WindowEventHandlers, ev: GamepadEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/hashchange_event)
    */
   onhashchange:
-    | ((this: WindowEventHandlers, ev: HashChangeEvent) => any)
+    | ((this: WindowEventHandlers, ev: HashChangeEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/languagechange_event)
    */
-  onlanguagechange: ((this: WindowEventHandlers, ev: Event) => any) | null;
+  onlanguagechange: ((this: WindowEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/message_event)
    */
-  onmessage: ((this: WindowEventHandlers, ev: MessageEvent) => any) | null;
+  onmessage: ((this: WindowEventHandlers, ev: MessageEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/messageerror_event)
    */
-  onmessageerror: ((this: WindowEventHandlers, ev: MessageEvent) => any) | null;
+  onmessageerror:
+    | ((this: WindowEventHandlers, ev: MessageEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/offline_event)
    */
-  onoffline: ((this: WindowEventHandlers, ev: Event) => any) | null;
+  onoffline: ((this: WindowEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/online_event)
    */
-  ononline: ((this: WindowEventHandlers, ev: Event) => any) | null;
+  ononline: ((this: WindowEventHandlers, ev: Event) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/pagehide_event)
    */
   onpagehide:
-    | ((this: WindowEventHandlers, ev: PageTransitionEvent) => any)
+    | ((this: WindowEventHandlers, ev: PageTransitionEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/pageshow_event)
    */
   onpageshow:
-    | ((this: WindowEventHandlers, ev: PageTransitionEvent) => any)
+    | ((this: WindowEventHandlers, ev: PageTransitionEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/popstate_event)
    */
-  onpopstate: ((this: WindowEventHandlers, ev: PopStateEvent) => any) | null;
+  onpopstate:
+    | ((this: WindowEventHandlers, ev: PopStateEvent) => unknown)
+    | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/rejectionhandled_event)
    */
   onrejectionhandled:
-    | ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => any)
+    | ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => unknown)
     | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/storage_event)
    */
-  onstorage: ((this: WindowEventHandlers, ev: StorageEvent) => any) | null;
+  onstorage: ((this: WindowEventHandlers, ev: StorageEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Window/unhandledrejection_event)
    */
   onunhandledrejection:
-    | ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => any)
+    | ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => unknown)
     | null;
   /**
    * @deprecated
@@ -41531,13 +41874,13 @@ interface WindowEventHandlers {
    *   [MDN
    *   Reference](https://developer.mozilla.org/docs/Web/API/Window/unload_event)
    */
-  onunload: ((this: WindowEventHandlers, ev: Event) => any) | null;
+  onunload: ((this: WindowEventHandlers, ev: Event) => unknown) | null;
   addEventListener<K extends keyof WindowEventHandlersEventMap>(
     type: K,
     listener: (
       this: WindowEventHandlers,
       ev: WindowEventHandlersEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -41550,7 +41893,7 @@ interface WindowEventHandlers {
     listener: (
       this: WindowEventHandlers,
       ev: WindowEventHandlersEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -41622,21 +41965,24 @@ interface WindowOrWorkerGlobalScope {
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/queueMicrotask) */
   queueMicrotask(callback: VoidFunction): void;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/reportError) */
-  reportError(e: any): void;
+  reportError(e: unknown): void;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/setInterval) */
   setInterval(
     handler: TimerHandler,
     timeout?: number,
-    ...arguments: any[]
+    ...arguments: readonly unknown[]
   ): number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/setTimeout) */
   setTimeout(
     handler: TimerHandler,
     timeout?: number,
-    ...arguments: any[]
+    ...arguments: readonly unknown[]
   ): number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/structuredClone) */
-  structuredClone<T = any>(value: T, options?: StructuredSerializeOptions): T;
+  structuredClone<T = unknown>(
+    value: T,
+    options?: StructuredSerializeOptions,
+  ): T;
 }
 
 interface WindowSessionStorage {
@@ -41665,12 +42011,12 @@ interface Worker extends EventTarget, AbstractWorker {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Worker/message_event)
    */
-  onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
+  onmessage: ((this: Worker, ev: MessageEvent) => unknown) | null;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Worker/messageerror_event)
    */
-  onmessageerror: ((this: Worker, ev: MessageEvent) => any) | null;
+  onmessageerror: ((this: Worker, ev: MessageEvent) => unknown) | null;
   /**
    * Clones message and transmits it to worker's global environment. transfer
    * can be passed as a list of objects that are to be transferred rather than
@@ -41679,8 +42025,8 @@ interface Worker extends EventTarget, AbstractWorker {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/Worker/postMessage)
    */
-  postMessage(message: any, transfer: Transferable[]): void;
-  postMessage(message: any, options?: StructuredSerializeOptions): void;
+  postMessage(message: unknown, transfer: readonly Transferable[]): void;
+  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
   /**
    * Aborts worker's associated global environment.
    *
@@ -41690,7 +42036,7 @@ interface Worker extends EventTarget, AbstractWorker {
   terminate(): void;
   addEventListener<K extends keyof WorkerEventMap>(
     type: K,
-    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
+    listener: (this: Worker, ev: WorkerEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -41700,7 +42046,7 @@ interface Worker extends EventTarget, AbstractWorker {
   ): void;
   removeEventListener<K extends keyof WorkerEventMap>(
     type: K,
-    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
+    listener: (this: Worker, ev: WorkerEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -41710,7 +42056,7 @@ interface Worker extends EventTarget, AbstractWorker {
   ): void;
 }
 
-declare var Worker: {
+declare const Worker: {
   prototype: Worker;
   new (scriptURL: string | URL, options?: WorkerOptions): Worker;
 };
@@ -41742,7 +42088,7 @@ interface Worklet {
   addModule(moduleURL: string | URL, options?: WorkletOptions): Promise<void>;
 }
 
-declare var Worklet: {
+declare const Worklet: {
   prototype: Worklet;
   new (): Worklet;
 };
@@ -41754,7 +42100,7 @@ declare var Worklet: {
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStream)
  */
-interface WritableStream<W = any> {
+interface WritableStream<W = unknown> {
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WritableStream/locked)
@@ -41764,7 +42110,7 @@ interface WritableStream<W = any> {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WritableStream/abort)
    */
-  abort(reason?: any): Promise<void>;
+  abort(reason?: unknown): Promise<void>;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WritableStream/close)
@@ -41777,9 +42123,9 @@ interface WritableStream<W = any> {
   getWriter(): WritableStreamDefaultWriter<W>;
 }
 
-declare var WritableStream: {
+declare const WritableStream: {
   prototype: WritableStream;
-  new <W = any>(
+  new <W = unknown>(
     underlyingSink?: UnderlyingSink<W>,
     strategy?: QueuingStrategy<W>,
   ): WritableStream<W>;
@@ -41804,10 +42150,10 @@ interface WritableStreamDefaultController {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultController/error)
    */
-  error(e?: any): void;
+  error(e?: unknown): void;
 }
 
-declare var WritableStreamDefaultController: {
+declare const WritableStreamDefaultController: {
   prototype: WritableStreamDefaultController;
   new (): WritableStreamDefaultController;
 };
@@ -41821,7 +42167,7 @@ declare var WritableStreamDefaultController: {
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter)
  */
-interface WritableStreamDefaultWriter<W = any> {
+interface WritableStreamDefaultWriter<W = unknown> {
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/closed)
@@ -41841,7 +42187,7 @@ interface WritableStreamDefaultWriter<W = any> {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/abort)
    */
-  abort(reason?: any): Promise<void>;
+  abort(reason?: unknown): Promise<void>;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/close)
@@ -41859,9 +42205,9 @@ interface WritableStreamDefaultWriter<W = any> {
   write(chunk?: W): Promise<void>;
 }
 
-declare var WritableStreamDefaultWriter: {
+declare const WritableStreamDefaultWriter: {
   prototype: WritableStreamDefaultWriter;
-  new <W = any>(stream: WritableStream<W>): WritableStreamDefaultWriter<W>;
+  new <W = unknown>(stream: WritableStream<W>): WritableStreamDefaultWriter<W>;
 };
 
 /**
@@ -41874,7 +42220,7 @@ declare var WritableStreamDefaultWriter: {
 interface XMLDocument extends Document {
   addEventListener<K extends keyof DocumentEventMap>(
     type: K,
-    listener: (this: XMLDocument, ev: DocumentEventMap[K]) => any,
+    listener: (this: XMLDocument, ev: DocumentEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -41884,7 +42230,7 @@ interface XMLDocument extends Document {
   ): void;
   removeEventListener<K extends keyof DocumentEventMap>(
     type: K,
-    listener: (this: XMLDocument, ev: DocumentEventMap[K]) => any,
+    listener: (this: XMLDocument, ev: DocumentEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -41894,7 +42240,7 @@ interface XMLDocument extends Document {
   ): void;
 }
 
-declare var XMLDocument: {
+declare const XMLDocument: {
   prototype: XMLDocument;
   new (): XMLDocument;
 };
@@ -41916,7 +42262,7 @@ interface XMLHttpRequest extends XMLHttpRequestEventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/readystatechange_event)
    */
-  onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null;
+  onreadystatechange: ((this: XMLHttpRequest, ev: Event) => unknown) | null;
   /**
    * Returns client's state.
    *
@@ -41930,7 +42276,7 @@ interface XMLHttpRequest extends XMLHttpRequestEventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/response)
    */
-  readonly response: any;
+  readonly response: unknown;
   /**
    * Returns response as text.
    *
@@ -42052,9 +42398,9 @@ interface XMLHttpRequest extends XMLHttpRequestEventTarget {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/open)
    */
-  open(method: string, url: string | URL): void;
+  open(method: 'post' | 'get' | 'dialog', url: string | URL): void;
   open(
-    method: string,
+    method: 'post' | 'get' | 'dialog',
     url: string | URL,
     async: boolean,
     username?: string | null,
@@ -42101,7 +42447,7 @@ interface XMLHttpRequest extends XMLHttpRequestEventTarget {
   readonly DONE: 4;
   addEventListener<K extends keyof XMLHttpRequestEventMap>(
     type: K,
-    listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => any,
+    listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -42111,7 +42457,7 @@ interface XMLHttpRequest extends XMLHttpRequestEventTarget {
   ): void;
   removeEventListener<K extends keyof XMLHttpRequestEventMap>(
     type: K,
-    listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => any,
+    listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -42121,7 +42467,7 @@ interface XMLHttpRequest extends XMLHttpRequestEventTarget {
   ): void;
 }
 
-declare var XMLHttpRequest: {
+declare const XMLHttpRequest: {
   prototype: XMLHttpRequest;
   new (): XMLHttpRequest;
   readonly UNSENT: 0;
@@ -42146,19 +42492,19 @@ interface XMLHttpRequestEventTargetEventMap {
  * Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequestEventTarget)
  */
 interface XMLHttpRequestEventTarget extends EventTarget {
-  onabort: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
-  onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
-  onload: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
-  onloadend: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
-  onloadstart: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
-  onprogress: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
-  ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
+  onabort: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;
+  onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;
+  onload: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;
+  onloadend: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;
+  onloadstart: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;
+  onprogress: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;
+  ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;
   addEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(
     type: K,
     listener: (
       this: XMLHttpRequestEventTarget,
       ev: XMLHttpRequestEventTargetEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -42171,7 +42517,7 @@ interface XMLHttpRequestEventTarget extends EventTarget {
     listener: (
       this: XMLHttpRequestEventTarget,
       ev: XMLHttpRequestEventTargetEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -42181,7 +42527,7 @@ interface XMLHttpRequestEventTarget extends EventTarget {
   ): void;
 }
 
-declare var XMLHttpRequestEventTarget: {
+declare const XMLHttpRequestEventTarget: {
   prototype: XMLHttpRequestEventTarget;
   new (): XMLHttpRequestEventTarget;
 };
@@ -42196,7 +42542,7 @@ interface XMLHttpRequestUpload extends XMLHttpRequestEventTarget {
     listener: (
       this: XMLHttpRequestUpload,
       ev: XMLHttpRequestEventTargetEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
@@ -42209,7 +42555,7 @@ interface XMLHttpRequestUpload extends XMLHttpRequestEventTarget {
     listener: (
       this: XMLHttpRequestUpload,
       ev: XMLHttpRequestEventTargetEventMap[K],
-    ) => any,
+    ) => unknown,
     options?: boolean | EventListenerOptions,
   ): void;
   removeEventListener(
@@ -42219,7 +42565,7 @@ interface XMLHttpRequestUpload extends XMLHttpRequestEventTarget {
   ): void;
 }
 
-declare var XMLHttpRequestUpload: {
+declare const XMLHttpRequestUpload: {
   prototype: XMLHttpRequestUpload;
   new (): XMLHttpRequestUpload;
 };
@@ -42238,7 +42584,7 @@ interface XMLSerializer {
   serializeToString(root: Node): string;
 }
 
-declare var XMLSerializer: {
+declare const XMLSerializer: {
   prototype: XMLSerializer;
   new (): XMLSerializer;
 };
@@ -42251,7 +42597,7 @@ declare var XMLSerializer: {
  */
 interface XPathEvaluator extends XPathEvaluatorBase {}
 
-declare var XPathEvaluator: {
+declare const XPathEvaluator: {
   prototype: XPathEvaluator;
   new (): XPathEvaluator;
 };
@@ -42301,7 +42647,7 @@ interface XPathExpression {
   ): XPathResult;
 }
 
-declare var XPathExpression: {
+declare const XPathExpression: {
   prototype: XPathExpression;
   new (): XPathExpression;
 };
@@ -42370,7 +42716,7 @@ interface XPathResult {
   readonly FIRST_ORDERED_NODE_TYPE: 9;
 }
 
-declare var XPathResult: {
+declare const XPathResult: {
   prototype: XPathResult;
   new (): XPathResult;
   readonly ANY_TYPE: 0;
@@ -42403,7 +42749,7 @@ interface XSLTProcessor {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/XSLTProcessor/getParameter)
    */
-  getParameter(namespaceURI: string | null, localName: string): any;
+  getParameter(namespaceURI: string | null, localName: string): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/XSLTProcessor/importStylesheet)
@@ -42426,7 +42772,7 @@ interface XSLTProcessor {
   setParameter(
     namespaceURI: string | null,
     localName: string,
-    value: any,
+    value: unknown,
   ): void;
   /**
    * [MDN
@@ -42440,7 +42786,7 @@ interface XSLTProcessor {
   transformToFragment(source: Node, output: Document): DocumentFragment;
 }
 
-declare var XSLTProcessor: {
+declare const XSLTProcessor: {
   prototype: XSLTProcessor;
   new (): XSLTProcessor;
 };
@@ -42451,7 +42797,7 @@ interface Console {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/assert_static)
    */
-  assert(condition?: boolean, ...data: any[]): void;
+  assert(condition?: boolean, ...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/clear_static)
@@ -42471,32 +42817,32 @@ interface Console {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/debug_static)
    */
-  debug(...data: any[]): void;
+  debug(...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/dir_static)
    */
-  dir(item?: any, options?: any): void;
+  dir(item?: unknown, options?: unknown): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/dirxml_static)
    */
-  dirxml(...data: any[]): void;
+  dirxml(...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/error_static)
    */
-  error(...data: any[]): void;
+  error(...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/group_static)
    */
-  group(...data: any[]): void;
+  group(...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/groupCollapsed_static)
    */
-  groupCollapsed(...data: any[]): void;
+  groupCollapsed(...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/groupEnd_static)
@@ -42506,17 +42852,17 @@ interface Console {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/info_static)
    */
-  info(...data: any[]): void;
+  info(...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/log_static)
    */
-  log(...data: any[]): void;
+  log(...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/table_static)
    */
-  table(tabularData?: any, properties?: string[]): void;
+  table(tabularData?: unknown, properties?: readonly string[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/time_static)
@@ -42531,21 +42877,21 @@ interface Console {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/timeLog_static)
    */
-  timeLog(label?: string, ...data: any[]): void;
+  timeLog(label?: string, ...data: readonly unknown[]): void;
   timeStamp(label?: string): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/trace_static)
    */
-  trace(...data: any[]): void;
+  trace(...data: readonly unknown[]): void;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/console/warn_static)
    */
-  warn(...data: any[]): void;
+  warn(...data: readonly unknown[]): void;
 }
 
-declare var console: Console;
+declare const console: Console;
 
 /**
  * Holds useful CSS-related methods. No object with this interface are
@@ -42557,7 +42903,7 @@ declare namespace CSS {
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSS/highlights_static)
    */
-  var highlights: HighlightRegistry;
+  const highlights: HighlightRegistry;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/CSS/factory_functions_static)
@@ -42857,7 +43203,7 @@ declare namespace CSS {
 declare namespace WebAssembly {
   interface CompileError extends Error {}
 
-  var CompileError: {
+  const CompileError: {
     prototype: CompileError;
     new (message?: string): CompileError;
     (message?: string): CompileError;
@@ -42880,7 +43226,7 @@ declare namespace WebAssembly {
     valueOf(): ValueTypeMap[T];
   }
 
-  var Global: {
+  const Global: {
     prototype: Global;
     new <T extends ValueType = ValueType>(
       descriptor: GlobalDescriptor<T>,
@@ -42900,14 +43246,14 @@ declare namespace WebAssembly {
     readonly exports: Exports;
   }
 
-  var Instance: {
+  const Instance: {
     prototype: Instance;
     new (module: Module, importObject?: Imports): Instance;
   };
 
   interface LinkError extends Error {}
 
-  var LinkError: {
+  const LinkError: {
     prototype: LinkError;
     new (message?: string): LinkError;
     (message?: string): LinkError;
@@ -42930,7 +43276,7 @@ declare namespace WebAssembly {
     grow(delta: number): number;
   }
 
-  var Memory: {
+  const Memory: {
     prototype: Memory;
     new (descriptor: MemoryDescriptor): Memory;
   };
@@ -42941,29 +43287,32 @@ declare namespace WebAssembly {
    */
   interface Module {}
 
-  var Module: {
+  const Module: {
     prototype: Module;
     new (bytes: BufferSource): Module;
     /**
      * [MDN
      * Reference](https://developer.mozilla.org/docs/WebAssembly/JavaScript_interface/Module/customSections_static)
      */
-    customSections(moduleObject: Module, sectionName: string): ArrayBuffer[];
+    customSections(
+      moduleObject: Module,
+      sectionName: string,
+    ): readonly ArrayBuffer[];
     /**
      * [MDN
      * Reference](https://developer.mozilla.org/docs/WebAssembly/JavaScript_interface/Module/exports_static)
      */
-    exports(moduleObject: Module): ModuleExportDescriptor[];
+    exports(moduleObject: Module): readonly ModuleExportDescriptor[];
     /**
      * [MDN
      * Reference](https://developer.mozilla.org/docs/WebAssembly/JavaScript_interface/Module/imports_static)
      */
-    imports(moduleObject: Module): ModuleImportDescriptor[];
+    imports(moduleObject: Module): readonly ModuleImportDescriptor[];
   };
 
   interface RuntimeError extends Error {}
 
-  var RuntimeError: {
+  const RuntimeError: {
     prototype: RuntimeError;
     new (message?: string): RuntimeError;
     (message?: string): RuntimeError;
@@ -42983,22 +43332,22 @@ declare namespace WebAssembly {
      * [MDN
      * Reference](https://developer.mozilla.org/docs/WebAssembly/JavaScript_interface/Table/get)
      */
-    get(index: number): any;
+    get(index: number): unknown;
     /**
      * [MDN
      * Reference](https://developer.mozilla.org/docs/WebAssembly/JavaScript_interface/Table/grow)
      */
-    grow(delta: number, value?: any): number;
+    grow(delta: number, value?: unknown): number;
     /**
      * [MDN
      * Reference](https://developer.mozilla.org/docs/WebAssembly/JavaScript_interface/Table/set)
      */
-    set(index: number, value?: any): void;
+    set(index: number, value?: unknown): void;
   }
 
-  var Table: {
+  const Table: {
     prototype: Table;
-    new (descriptor: TableDescriptor, value?: any): Table;
+    new (descriptor: TableDescriptor, value?: unknown): Table;
   };
 
   interface GlobalDescriptor<T extends ValueType = ValueType> {
@@ -43031,7 +43380,7 @@ declare namespace WebAssembly {
 
   interface ValueTypeMap {
     anyfunc: Function;
-    externref: any;
+    externref: unknown;
     f32: number;
     f64: number;
     i32: number;
@@ -43096,7 +43445,7 @@ interface BlobCallback {
 }
 
 interface CustomElementConstructor {
-  new (...params: any[]): HTMLElement;
+  new (...params: readonly unknown[]): HTMLElement;
 }
 
 interface DecodeErrorCallback {
@@ -43120,7 +43469,7 @@ interface FileCallback {
 }
 
 interface FileSystemEntriesCallback {
-  (entries: FileSystemEntry[]): void;
+  (entries: readonly FileSystemEntry[]): void;
 }
 
 interface FileSystemEntryCallback {
@@ -43140,11 +43489,14 @@ interface IdleRequestCallback {
 }
 
 interface IntersectionObserverCallback {
-  (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void;
+  (
+    entries: readonly IntersectionObserverEntry[],
+    observer: IntersectionObserver,
+  ): void;
 }
 
 interface LockGrantedCallback {
-  (lock: Lock | null): any;
+  (lock: Lock | null): unknown;
 }
 
 interface MediaSessionActionHandler {
@@ -43152,7 +43504,7 @@ interface MediaSessionActionHandler {
 }
 
 interface MutationCallback {
-  (mutations: MutationRecord[], observer: MutationObserver): void;
+  (mutations: readonly MutationRecord[], observer: MutationObserver): void;
 }
 
 interface NotificationPermissionCallback {
@@ -43170,7 +43522,7 @@ interface OnErrorEventHandlerNonNull {
     lineno?: number,
     colno?: number,
     error?: Error,
-  ): any;
+  ): unknown;
 }
 
 interface PerformanceObserverCallback {
@@ -43185,7 +43537,7 @@ interface PositionErrorCallback {
   (positionError: GeolocationPositionError): void;
 }
 
-interface QueuingStrategySize<T = any> {
+interface QueuingStrategySize<T = unknown> {
   (chunk: T): number;
 }
 
@@ -43202,11 +43554,11 @@ interface RemotePlaybackAvailabilityCallback {
 }
 
 interface ReportingObserverCallback {
-  (reports: Report[], observer: ReportingObserver): void;
+  (reports: readonly Report[], observer: ReportingObserver): void;
 }
 
 interface ResizeObserverCallback {
-  (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
+  (entries: readonly ResizeObserverEntry[], observer: ResizeObserver): void;
 }
 
 interface TransformerFlushCallback<O> {
@@ -43214,7 +43566,7 @@ interface TransformerFlushCallback<O> {
 }
 
 interface TransformerStartCallback<O> {
-  (controller: TransformStreamDefaultController<O>): any;
+  (controller: TransformStreamDefaultController<O>): unknown;
 }
 
 interface TransformerTransformCallback<I, O> {
@@ -43225,7 +43577,7 @@ interface TransformerTransformCallback<I, O> {
 }
 
 interface UnderlyingSinkAbortCallback {
-  (reason?: any): void | PromiseLike<void>;
+  (reason?: unknown): void | PromiseLike<void>;
 }
 
 interface UnderlyingSinkCloseCallback {
@@ -43233,7 +43585,7 @@ interface UnderlyingSinkCloseCallback {
 }
 
 interface UnderlyingSinkStartCallback {
-  (controller: WritableStreamDefaultController): any;
+  (controller: WritableStreamDefaultController): unknown;
 }
 
 interface UnderlyingSinkWriteCallback<W> {
@@ -43244,7 +43596,7 @@ interface UnderlyingSinkWriteCallback<W> {
 }
 
 interface UnderlyingSourceCancelCallback {
-  (reason?: any): void | PromiseLike<void>;
+  (reason?: unknown): void | PromiseLike<void>;
 }
 
 interface UnderlyingSourcePullCallback<R> {
@@ -43252,7 +43604,7 @@ interface UnderlyingSourcePullCallback<R> {
 }
 
 interface UnderlyingSourceStartCallback<R> {
-  (controller: ReadableStreamController<R>): any;
+  (controller: ReadableStreamController<R>): unknown;
 }
 
 interface VideoFrameOutputCallback {
@@ -43524,16 +43876,16 @@ interface MathMLElementTagNameMap {
 type ElementTagNameMap = HTMLElementTagNameMap &
   Pick<
     SVGElementTagNameMap,
-    Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>
+    RelaxedExclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>
   >;
 
-declare var Audio: {
+declare const Audio: {
   new (src?: string): HTMLAudioElement;
 };
-declare var Image: {
+declare const Image: {
   new (width?: number, height?: number): HTMLImageElement;
 };
-declare var Option: {
+declare const Option: {
   new (
     text?: string,
     value?: string,
@@ -43546,13 +43898,13 @@ declare var Option: {
  *
  *   [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/navigator)
  */
-declare var clientInformation: Navigator;
+declare const clientInformation: Navigator;
 /**
  * Returns true if the window has been closed, false otherwise.
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/closed)
  */
-declare var closed: boolean;
+declare const closed: boolean;
 /**
  * Defines a new custom element, mapping the given name to the given constructor
  * as an autonomous custom element.
@@ -43560,72 +43912,72 @@ declare var closed: boolean;
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/customElements)
  */
-declare var customElements: CustomElementRegistry;
+declare const customElements: CustomElementRegistry;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/devicePixelRatio)
  */
-declare var devicePixelRatio: number;
+declare const devicePixelRatio: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/document) */
-declare var document: Document;
+declare const document: Document;
 /**
  * @deprecated
  *
  *   [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/event)
  */
-declare var event: Event | undefined;
+declare const event: Event | undefined;
 /**
  * @deprecated
  *
  *   [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/external)
  */
-declare var external: External;
+declare const external: External;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/frameElement)
  */
-declare var frameElement: Element | null;
+declare const frameElement: Element | null;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/frames) */
-declare var frames: WindowProxy;
+declare const frames: WindowProxy;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/history) */
-declare var history: History;
+declare const history: History;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/innerHeight)
  */
-declare var innerHeight: number;
+declare const innerHeight: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/innerWidth) */
-declare var innerWidth: number;
+declare const innerWidth: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/length) */
-declare var length: number;
+declare const length: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/location) */
-declare var location: Location;
+declare const location: Location;
 /**
  * Returns true if the location bar is visible; otherwise, returns false.
  *
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/locationbar)
  */
-declare var locationbar: BarProp;
+declare const locationbar: BarProp;
 /**
  * Returns true if the menu bar is visible; otherwise, returns false.
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/menubar)
  */
-declare var menubar: BarProp;
+declare const menubar: BarProp;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/name) */
 /** @deprecated */
 declare const name: void;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/navigator) */
-declare var navigator: Navigator;
+declare const navigator: Navigator;
 /**
  * Available only in secure contexts.
  *
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/devicemotion_event)
  */
-declare var ondevicemotion:
-  | ((this: Window, ev: DeviceMotionEvent) => any)
+declare const ondevicemotion:
+  | ((this: Window, ev: DeviceMotionEvent) => unknown)
   | null;
 /**
  * Available only in secure contexts.
@@ -43633,8 +43985,8 @@ declare var ondevicemotion:
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/deviceorientation_event)
  */
-declare var ondeviceorientation:
-  | ((this: Window, ev: DeviceOrientationEvent) => any)
+declare const ondeviceorientation:
+  | ((this: Window, ev: DeviceOrientationEvent) => unknown)
   | null;
 /**
  * Available only in secure contexts.
@@ -43642,8 +43994,8 @@ declare var ondeviceorientation:
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/deviceorientationabsolute_event)
  */
-declare var ondeviceorientationabsolute:
-  | ((this: Window, ev: DeviceOrientationEvent) => any)
+declare const ondeviceorientationabsolute:
+  | ((this: Window, ev: DeviceOrientationEvent) => unknown)
   | null;
 /**
  * @deprecated
@@ -43651,35 +44003,37 @@ declare var ondeviceorientationabsolute:
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Window/orientationchange_event)
  */
-declare var onorientationchange: ((this: Window, ev: Event) => any) | null;
+declare const onorientationchange:
+  | ((this: Window, ev: Event) => unknown)
+  | null;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/opener) */
-declare var opener: any;
+declare const opener: unknown;
 /**
  * @deprecated
  *
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Window/orientation)
  */
-declare var orientation: number;
+declare const orientation: number;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/outerHeight)
  */
-declare var outerHeight: number;
+declare const outerHeight: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/outerWidth) */
-declare var outerWidth: number;
+declare const outerWidth: number;
 /**
  * @deprecated This is a legacy alias of `scrollX`.
  *
  *   [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollX)
  */
-declare var pageXOffset: number;
+declare const pageXOffset: number;
 /**
  * @deprecated This is a legacy alias of `scrollY`.
  *
  *   [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollY)
  */
-declare var pageYOffset: number;
+declare const pageYOffset: number;
 /**
  * Refers to either the parent WindowProxy, or itself.
  *
@@ -43688,70 +44042,70 @@ declare var pageYOffset: number;
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/parent)
  */
-declare var parent: WindowProxy;
+declare const parent: WindowProxy;
 /**
  * Returns true if the personal bar is visible; otherwise, returns false.
  *
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/personalbar)
  */
-declare var personalbar: BarProp;
+declare const personalbar: BarProp;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screen) */
-declare var screen: Screen;
+declare const screen: Screen;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screenLeft) */
-declare var screenLeft: number;
+declare const screenLeft: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screenTop) */
-declare var screenTop: number;
+declare const screenTop: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screenX) */
-declare var screenX: number;
+declare const screenX: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/screenY) */
-declare var screenY: number;
+declare const screenY: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollX) */
-declare var scrollX: number;
+declare const scrollX: number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollY) */
-declare var scrollY: number;
+declare const scrollY: number;
 /**
  * Returns true if the scrollbars are visible; otherwise, returns false.
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/scrollbars)
  */
-declare var scrollbars: BarProp;
+declare const scrollbars: BarProp;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/self) */
-declare var self: Window & typeof globalThis;
+declare const self: Window & typeof globalThis;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/speechSynthesis)
  */
-declare var speechSynthesis: SpeechSynthesis;
+declare const speechSynthesis: SpeechSynthesis;
 /**
  * @deprecated
  *
  *   [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/status)
  */
-declare var status: string;
+declare const status: string;
 /**
  * Returns true if the status bar is visible; otherwise, returns false.
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/statusbar)
  */
-declare var statusbar: BarProp;
+declare const statusbar: BarProp;
 /**
  * Returns true if the toolbar is visible; otherwise, returns false.
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/toolbar)
  */
-declare var toolbar: BarProp;
+declare const toolbar: BarProp;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/top) */
-declare var top: WindowProxy | null;
+declare const top: WindowProxy | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/visualViewport)
  */
-declare var visualViewport: VisualViewport | null;
+declare const visualViewport: VisualViewport | null;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/window) */
-declare var window: Window & typeof globalThis;
+declare const window: Window & typeof globalThis;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/alert) */
-declare function alert(message?: any): void;
+declare function alert(message?: unknown): void;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/blur) */
 declare function blur(): void;
 /**
@@ -43829,12 +44183,12 @@ declare function open(
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/postMessage)
  */
 declare function postMessage(
-  message: any,
+  message: unknown,
   targetOrigin: string,
-  transfer?: Transferable[],
+  transfer?: readonly Transferable[],
 ): void;
 declare function postMessage(
-  message: any,
+  message: unknown,
   options?: WindowPostMessageOptions,
 ): void;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/print) */
@@ -43903,48 +44257,50 @@ declare function requestAnimationFrame(callback: FrameRequestCallback): number;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/abort_event)
  */
-declare var onabort: ((this: Window, ev: UIEvent) => any) | null;
+declare const onabort: ((this: Window, ev: UIEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/animationcancel_event)
  */
-declare var onanimationcancel:
-  | ((this: Window, ev: AnimationEvent) => any)
+declare const onanimationcancel:
+  | ((this: Window, ev: AnimationEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event)
  */
-declare var onanimationend: ((this: Window, ev: AnimationEvent) => any) | null;
+declare const onanimationend:
+  | ((this: Window, ev: AnimationEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event)
  */
-declare var onanimationiteration:
-  | ((this: Window, ev: AnimationEvent) => any)
+declare const onanimationiteration:
+  | ((this: Window, ev: AnimationEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event)
  */
-declare var onanimationstart:
-  | ((this: Window, ev: AnimationEvent) => any)
+declare const onanimationstart:
+  | ((this: Window, ev: AnimationEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/auxclick_event)
  */
-declare var onauxclick: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onauxclick: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/beforeinput_event)
  */
-declare var onbeforeinput: ((this: Window, ev: InputEvent) => any) | null;
+declare const onbeforeinput: ((this: Window, ev: InputEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event)
  */
-declare var onbeforetoggle: ((this: Window, ev: Event) => any) | null;
+declare const onbeforetoggle: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Fires when the object loses the input focus.
  *
@@ -43953,12 +44309,12 @@ declare var onbeforetoggle: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/blur_event)
  */
-declare var onblur: ((this: Window, ev: FocusEvent) => any) | null;
+declare const onblur: ((this: Window, ev: FocusEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/cancel_event)
  */
-declare var oncancel: ((this: Window, ev: Event) => any) | null;
+declare const oncancel: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when playback is possible, but would require further buffering.
  *
@@ -43967,12 +44323,12 @@ declare var oncancel: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplay_event)
  */
-declare var oncanplay: ((this: Window, ev: Event) => any) | null;
+declare const oncanplay: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event)
  */
-declare var oncanplaythrough: ((this: Window, ev: Event) => any) | null;
+declare const oncanplaythrough: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Fires when the contents of the object or selection have changed.
  *
@@ -43981,7 +44337,7 @@ declare var oncanplaythrough: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event)
  */
-declare var onchange: ((this: Window, ev: Event) => any) | null;
+declare const onchange: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Fires when the user clicks the left mouse button on the object
  *
@@ -43990,12 +44346,12 @@ declare var onchange: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/click_event)
  */
-declare var onclick: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onclick: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/close_event)
  */
-declare var onclose: ((this: Window, ev: Event) => any) | null;
+declare const onclose: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Fires when the user clicks the right mouse button in the client area, opening
  * the context menu.
@@ -44005,19 +44361,19 @@ declare var onclose: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/contextmenu_event)
  */
-declare var oncontextmenu: ((this: Window, ev: MouseEvent) => any) | null;
+declare const oncontextmenu: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/copy_event)
  */
-declare var oncopy: ((this: Window, ev: ClipboardEvent) => any) | null;
+declare const oncopy: ((this: Window, ev: ClipboardEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLTrackElement/cuechange_event)
  */
-declare var oncuechange: ((this: Window, ev: Event) => any) | null;
+declare const oncuechange: ((this: Window, ev: Event) => unknown) | null;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/cut_event) */
-declare var oncut: ((this: Window, ev: ClipboardEvent) => any) | null;
+declare const oncut: ((this: Window, ev: ClipboardEvent) => unknown) | null;
 /**
  * Fires when the user double-clicks the object.
  *
@@ -44026,7 +44382,7 @@ declare var oncut: ((this: Window, ev: ClipboardEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/dblclick_event)
  */
-declare var ondblclick: ((this: Window, ev: MouseEvent) => any) | null;
+declare const ondblclick: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * Fires on the source object continuously during a drag operation.
  *
@@ -44035,7 +44391,7 @@ declare var ondblclick: ((this: Window, ev: MouseEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drag_event)
  */
-declare var ondrag: ((this: Window, ev: DragEvent) => any) | null;
+declare const ondrag: ((this: Window, ev: DragEvent) => unknown) | null;
 /**
  * Fires on the source object when the user releases the mouse at the close of a
  * drag operation.
@@ -44045,7 +44401,7 @@ declare var ondrag: ((this: Window, ev: DragEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragend_event)
  */
-declare var ondragend: ((this: Window, ev: DragEvent) => any) | null;
+declare const ondragend: ((this: Window, ev: DragEvent) => unknown) | null;
 /**
  * Fires on the target element when the user drags the object to a valid drop
  * target.
@@ -44055,7 +44411,7 @@ declare var ondragend: ((this: Window, ev: DragEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragenter_event)
  */
-declare var ondragenter: ((this: Window, ev: DragEvent) => any) | null;
+declare const ondragenter: ((this: Window, ev: DragEvent) => unknown) | null;
 /**
  * Fires on the target object when the user moves the mouse out of a valid drop
  * target during a drag operation.
@@ -44065,7 +44421,7 @@ declare var ondragenter: ((this: Window, ev: DragEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragleave_event)
  */
-declare var ondragleave: ((this: Window, ev: DragEvent) => any) | null;
+declare const ondragleave: ((this: Window, ev: DragEvent) => unknown) | null;
 /**
  * Fires on the target element continuously while the user drags the object over
  * a valid drop target.
@@ -44075,7 +44431,7 @@ declare var ondragleave: ((this: Window, ev: DragEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragover_event)
  */
-declare var ondragover: ((this: Window, ev: DragEvent) => any) | null;
+declare const ondragover: ((this: Window, ev: DragEvent) => unknown) | null;
 /**
  * Fires on the source object when the user starts to drag a text selection or
  * selected object.
@@ -44085,12 +44441,12 @@ declare var ondragover: ((this: Window, ev: DragEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragstart_event)
  */
-declare var ondragstart: ((this: Window, ev: DragEvent) => any) | null;
+declare const ondragstart: ((this: Window, ev: DragEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drop_event)
  */
-declare var ondrop: ((this: Window, ev: DragEvent) => any) | null;
+declare const ondrop: ((this: Window, ev: DragEvent) => unknown) | null;
 /**
  * Occurs when the duration attribute is updated.
  *
@@ -44099,7 +44455,7 @@ declare var ondrop: ((this: Window, ev: DragEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/durationchange_event)
  */
-declare var ondurationchange: ((this: Window, ev: Event) => any) | null;
+declare const ondurationchange: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when the media element is reset to its initial state.
  *
@@ -44108,7 +44464,7 @@ declare var ondurationchange: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/emptied_event)
  */
-declare var onemptied: ((this: Window, ev: Event) => any) | null;
+declare const onemptied: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when the end of playback is reached.
  *
@@ -44117,7 +44473,7 @@ declare var onemptied: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ended_event)
  */
-declare var onended: ((this: Window, ev: Event) => any) | null;
+declare const onended: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Fires when an error occurs during object loading.
  *
@@ -44126,7 +44482,7 @@ declare var onended: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/error_event)
  */
-declare var onerror: OnErrorEventHandler;
+declare const onerror: OnErrorEventHandler;
 /**
  * Fires when the object receives focus.
  *
@@ -44135,29 +44491,29 @@ declare var onerror: OnErrorEventHandler;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/focus_event)
  */
-declare var onfocus: ((this: Window, ev: FocusEvent) => any) | null;
+declare const onfocus: ((this: Window, ev: FocusEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/formdata_event)
  */
-declare var onformdata: ((this: Window, ev: FormDataEvent) => any) | null;
+declare const onformdata: ((this: Window, ev: FormDataEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/gotpointercapture_event)
  */
-declare var ongotpointercapture:
-  | ((this: Window, ev: PointerEvent) => any)
+declare const ongotpointercapture:
+  | ((this: Window, ev: PointerEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/input_event)
  */
-declare var oninput: ((this: Window, ev: Event) => any) | null;
+declare const oninput: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/invalid_event)
  */
-declare var oninvalid: ((this: Window, ev: Event) => any) | null;
+declare const oninvalid: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Fires when the user presses a key.
  *
@@ -44166,7 +44522,7 @@ declare var oninvalid: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/keydown_event)
  */
-declare var onkeydown: ((this: Window, ev: KeyboardEvent) => any) | null;
+declare const onkeydown: ((this: Window, ev: KeyboardEvent) => unknown) | null;
 /**
  * Fires when the user presses an alphanumeric key.
  *
@@ -44176,7 +44532,7 @@ declare var onkeydown: ((this: Window, ev: KeyboardEvent) => any) | null;
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/keypress_event)
  * @param ev The event.
  */
-declare var onkeypress: ((this: Window, ev: KeyboardEvent) => any) | null;
+declare const onkeypress: ((this: Window, ev: KeyboardEvent) => unknown) | null;
 /**
  * Fires when the user releases a key.
  *
@@ -44185,7 +44541,7 @@ declare var onkeypress: ((this: Window, ev: KeyboardEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/keyup_event)
  */
-declare var onkeyup: ((this: Window, ev: KeyboardEvent) => any) | null;
+declare const onkeyup: ((this: Window, ev: KeyboardEvent) => unknown) | null;
 /**
  * Fires immediately after the browser loads the object.
  *
@@ -44194,7 +44550,7 @@ declare var onkeyup: ((this: Window, ev: KeyboardEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/SVGElement/load_event)
  */
-declare var onload: ((this: Window, ev: Event) => any) | null;
+declare const onload: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when media data is loaded at the current playback position.
  *
@@ -44203,7 +44559,7 @@ declare var onload: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadeddata_event)
  */
-declare var onloadeddata: ((this: Window, ev: Event) => any) | null;
+declare const onloadeddata: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when the duration and dimensions of the media have been determined.
  *
@@ -44212,7 +44568,7 @@ declare var onloadeddata: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadedmetadata_event)
  */
-declare var onloadedmetadata: ((this: Window, ev: Event) => any) | null;
+declare const onloadedmetadata: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when Internet Explorer begins looking for media data.
  *
@@ -44221,13 +44577,13 @@ declare var onloadedmetadata: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadstart_event)
  */
-declare var onloadstart: ((this: Window, ev: Event) => any) | null;
+declare const onloadstart: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lostpointercapture_event)
  */
-declare var onlostpointercapture:
-  | ((this: Window, ev: PointerEvent) => any)
+declare const onlostpointercapture:
+  | ((this: Window, ev: PointerEvent) => unknown)
   | null;
 /**
  * Fires when the user clicks the object with either mouse button.
@@ -44237,17 +44593,17 @@ declare var onlostpointercapture:
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mousedown_event)
  */
-declare var onmousedown: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onmousedown: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseenter_event)
  */
-declare var onmouseenter: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onmouseenter: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseleave_event)
  */
-declare var onmouseleave: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onmouseleave: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * Fires when the user moves the mouse over the object.
  *
@@ -44256,7 +44612,7 @@ declare var onmouseleave: ((this: Window, ev: MouseEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mousemove_event)
  */
-declare var onmousemove: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onmousemove: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * Fires when the user moves the mouse pointer outside the boundaries of the
  * object.
@@ -44266,7 +44622,7 @@ declare var onmousemove: ((this: Window, ev: MouseEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseout_event)
  */
-declare var onmouseout: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onmouseout: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * Fires when the user moves the mouse pointer into the object.
  *
@@ -44275,7 +44631,7 @@ declare var onmouseout: ((this: Window, ev: MouseEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseover_event)
  */
-declare var onmouseover: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onmouseover: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * Fires when the user releases a mouse button while the mouse is over the
  * object.
@@ -44285,12 +44641,12 @@ declare var onmouseover: ((this: Window, ev: MouseEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseup_event)
  */
-declare var onmouseup: ((this: Window, ev: MouseEvent) => any) | null;
+declare const onmouseup: ((this: Window, ev: MouseEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/paste_event)
  */
-declare var onpaste: ((this: Window, ev: ClipboardEvent) => any) | null;
+declare const onpaste: ((this: Window, ev: ClipboardEvent) => unknown) | null;
 /**
  * Occurs when playback is paused.
  *
@@ -44299,7 +44655,7 @@ declare var onpaste: ((this: Window, ev: ClipboardEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/pause_event)
  */
-declare var onpause: ((this: Window, ev: Event) => any) | null;
+declare const onpause: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when the play method is requested.
  *
@@ -44308,7 +44664,7 @@ declare var onpause: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play_event)
  */
-declare var onplay: ((this: Window, ev: Event) => any) | null;
+declare const onplay: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when the audio or video has started playing.
  *
@@ -44317,47 +44673,61 @@ declare var onplay: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/playing_event)
  */
-declare var onplaying: ((this: Window, ev: Event) => any) | null;
+declare const onplaying: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointercancel_event)
  */
-declare var onpointercancel: ((this: Window, ev: PointerEvent) => any) | null;
+declare const onpointercancel:
+  | ((this: Window, ev: PointerEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)
  */
-declare var onpointerdown: ((this: Window, ev: PointerEvent) => any) | null;
+declare const onpointerdown:
+  | ((this: Window, ev: PointerEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)
  */
-declare var onpointerenter: ((this: Window, ev: PointerEvent) => any) | null;
+declare const onpointerenter:
+  | ((this: Window, ev: PointerEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)
  */
-declare var onpointerleave: ((this: Window, ev: PointerEvent) => any) | null;
+declare const onpointerleave:
+  | ((this: Window, ev: PointerEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event)
  */
-declare var onpointermove: ((this: Window, ev: PointerEvent) => any) | null;
+declare const onpointermove:
+  | ((this: Window, ev: PointerEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerout_event)
  */
-declare var onpointerout: ((this: Window, ev: PointerEvent) => any) | null;
+declare const onpointerout:
+  | ((this: Window, ev: PointerEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerover_event)
  */
-declare var onpointerover: ((this: Window, ev: PointerEvent) => any) | null;
+declare const onpointerover:
+  | ((this: Window, ev: PointerEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)
  */
-declare var onpointerup: ((this: Window, ev: PointerEvent) => any) | null;
+declare const onpointerup: ((this: Window, ev: PointerEvent) => unknown) | null;
 /**
  * Occurs to indicate progress while downloading media data.
  *
@@ -44366,7 +44736,7 @@ declare var onpointerup: ((this: Window, ev: PointerEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/progress_event)
  */
-declare var onprogress: ((this: Window, ev: ProgressEvent) => any) | null;
+declare const onprogress: ((this: Window, ev: ProgressEvent) => unknown) | null;
 /**
  * Occurs when the playback rate is increased or decreased.
  *
@@ -44375,7 +44745,7 @@ declare var onprogress: ((this: Window, ev: ProgressEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ratechange_event)
  */
-declare var onratechange: ((this: Window, ev: Event) => any) | null;
+declare const onratechange: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Fires when the user resets a form.
  *
@@ -44384,12 +44754,12 @@ declare var onratechange: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/reset_event)
  */
-declare var onreset: ((this: Window, ev: Event) => any) | null;
+declare const onreset: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/resize_event)
  */
-declare var onresize: ((this: Window, ev: UIEvent) => any) | null;
+declare const onresize: ((this: Window, ev: UIEvent) => unknown) | null;
 /**
  * Fires when the user repositions the scroll box in the scroll bar on the
  * object.
@@ -44399,18 +44769,18 @@ declare var onresize: ((this: Window, ev: UIEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Document/scroll_event)
  */
-declare var onscroll: ((this: Window, ev: Event) => any) | null;
+declare const onscroll: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollend_event)
  */
-declare var onscrollend: ((this: Window, ev: Event) => any) | null;
+declare const onscrollend: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Document/securitypolicyviolation_event)
  */
-declare var onsecuritypolicyviolation:
-  | ((this: Window, ev: SecurityPolicyViolationEvent) => any)
+declare const onsecuritypolicyviolation:
+  | ((this: Window, ev: SecurityPolicyViolationEvent) => unknown)
   | null;
 /**
  * Occurs when the seek operation ends.
@@ -44420,7 +44790,7 @@ declare var onsecuritypolicyviolation:
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeked_event)
  */
-declare var onseeked: ((this: Window, ev: Event) => any) | null;
+declare const onseeked: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when the current playback position is moved.
  *
@@ -44429,7 +44799,7 @@ declare var onseeked: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeking_event)
  */
-declare var onseeking: ((this: Window, ev: Event) => any) | null;
+declare const onseeking: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Fires when the current selection changes.
  *
@@ -44438,22 +44808,22 @@ declare var onseeking: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select_event)
  */
-declare var onselect: ((this: Window, ev: Event) => any) | null;
+declare const onselect: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Document/selectionchange_event)
  */
-declare var onselectionchange: ((this: Window, ev: Event) => any) | null;
+declare const onselectionchange: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event)
  */
-declare var onselectstart: ((this: Window, ev: Event) => any) | null;
+declare const onselectstart: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/slotchange_event)
  */
-declare var onslotchange: ((this: Window, ev: Event) => any) | null;
+declare const onslotchange: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when the download has stopped.
  *
@@ -44462,12 +44832,12 @@ declare var onslotchange: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/stalled_event)
  */
-declare var onstalled: ((this: Window, ev: Event) => any) | null;
+declare const onstalled: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/submit_event)
  */
-declare var onsubmit: ((this: Window, ev: SubmitEvent) => any) | null;
+declare const onsubmit: ((this: Window, ev: SubmitEvent) => unknown) | null;
 /**
  * Occurs if the load operation has been intentionally halted.
  *
@@ -44476,7 +44846,7 @@ declare var onsubmit: ((this: Window, ev: SubmitEvent) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/suspend_event)
  */
-declare var onsuspend: ((this: Window, ev: Event) => any) | null;
+declare const onsuspend: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs to indicate the current playback position.
  *
@@ -44485,71 +44855,71 @@ declare var onsuspend: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/timeupdate_event)
  */
-declare var ontimeupdate: ((this: Window, ev: Event) => any) | null;
+declare const ontimeupdate: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/HTMLDetailsElement/toggle_event)
  */
-declare var ontoggle: ((this: Window, ev: Event) => any) | null;
+declare const ontoggle: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/touchcancel_event)
  */
-declare var ontouchcancel:
-  | ((this: Window, ev: TouchEvent) => any)
+declare const ontouchcancel:
+  | ((this: Window, ev: TouchEvent) => unknown)
   | null
   | undefined;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/touchend_event)
  */
-declare var ontouchend:
-  | ((this: Window, ev: TouchEvent) => any)
+declare const ontouchend:
+  | ((this: Window, ev: TouchEvent) => unknown)
   | null
   | undefined;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/touchmove_event)
  */
-declare var ontouchmove:
-  | ((this: Window, ev: TouchEvent) => any)
+declare const ontouchmove:
+  | ((this: Window, ev: TouchEvent) => unknown)
   | null
   | undefined;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/touchstart_event)
  */
-declare var ontouchstart:
-  | ((this: Window, ev: TouchEvent) => any)
+declare const ontouchstart:
+  | ((this: Window, ev: TouchEvent) => unknown)
   | null
   | undefined;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/transitioncancel_event)
  */
-declare var ontransitioncancel:
-  | ((this: Window, ev: TransitionEvent) => any)
+declare const ontransitioncancel:
+  | ((this: Window, ev: TransitionEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event)
  */
-declare var ontransitionend:
-  | ((this: Window, ev: TransitionEvent) => any)
+declare const ontransitionend:
+  | ((this: Window, ev: TransitionEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionrun_event)
  */
-declare var ontransitionrun:
-  | ((this: Window, ev: TransitionEvent) => any)
+declare const ontransitionrun:
+  | ((this: Window, ev: TransitionEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionstart_event)
  */
-declare var ontransitionstart:
-  | ((this: Window, ev: TransitionEvent) => any)
+declare const ontransitionstart:
+  | ((this: Window, ev: TransitionEvent) => unknown)
   | null;
 /**
  * Occurs when the volume is changed, or playback is muted or unmuted.
@@ -44559,7 +44929,7 @@ declare var ontransitionstart:
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volumechange_event)
  */
-declare var onvolumechange: ((this: Window, ev: Event) => any) | null;
+declare const onvolumechange: ((this: Window, ev: Event) => unknown) | null;
 /**
  * Occurs when playback stops because the next frame of a video resource is not
  * available.
@@ -44569,22 +44939,24 @@ declare var onvolumechange: ((this: Window, ev: Event) => any) | null;
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waiting_event)
  */
-declare var onwaiting: ((this: Window, ev: Event) => any) | null;
+declare const onwaiting: ((this: Window, ev: Event) => unknown) | null;
 /**
  * @deprecated This is a legacy alias of `onanimationend`.
  *
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event)
  */
-declare var onwebkitanimationend: ((this: Window, ev: Event) => any) | null;
+declare const onwebkitanimationend:
+  | ((this: Window, ev: Event) => unknown)
+  | null;
 /**
  * @deprecated This is a legacy alias of `onanimationiteration`.
  *
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event)
  */
-declare var onwebkitanimationiteration:
-  | ((this: Window, ev: Event) => any)
+declare const onwebkitanimationiteration:
+  | ((this: Window, ev: Event) => unknown)
   | null;
 /**
  * @deprecated This is a legacy alias of `onanimationstart`.
@@ -44592,113 +44964,125 @@ declare var onwebkitanimationiteration:
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event)
  */
-declare var onwebkitanimationstart: ((this: Window, ev: Event) => any) | null;
+declare const onwebkitanimationstart:
+  | ((this: Window, ev: Event) => unknown)
+  | null;
 /**
  * @deprecated This is a legacy alias of `ontransitionend`.
  *
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event)
  */
-declare var onwebkittransitionend: ((this: Window, ev: Event) => any) | null;
+declare const onwebkittransitionend:
+  | ((this: Window, ev: Event) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Element/wheel_event)
  */
-declare var onwheel: ((this: Window, ev: WheelEvent) => any) | null;
+declare const onwheel: ((this: Window, ev: WheelEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/afterprint_event)
  */
-declare var onafterprint: ((this: Window, ev: Event) => any) | null;
+declare const onafterprint: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/beforeprint_event)
  */
-declare var onbeforeprint: ((this: Window, ev: Event) => any) | null;
+declare const onbeforeprint: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/beforeunload_event)
  */
-declare var onbeforeunload:
-  | ((this: Window, ev: BeforeUnloadEvent) => any)
+declare const onbeforeunload:
+  | ((this: Window, ev: BeforeUnloadEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/gamepadconnected_event)
  */
-declare var ongamepadconnected:
-  | ((this: Window, ev: GamepadEvent) => any)
+declare const ongamepadconnected:
+  | ((this: Window, ev: GamepadEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/gamepaddisconnected_event)
  */
-declare var ongamepaddisconnected:
-  | ((this: Window, ev: GamepadEvent) => any)
+declare const ongamepaddisconnected:
+  | ((this: Window, ev: GamepadEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/hashchange_event)
  */
-declare var onhashchange: ((this: Window, ev: HashChangeEvent) => any) | null;
+declare const onhashchange:
+  | ((this: Window, ev: HashChangeEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/languagechange_event)
  */
-declare var onlanguagechange: ((this: Window, ev: Event) => any) | null;
+declare const onlanguagechange: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/message_event)
  */
-declare var onmessage: ((this: Window, ev: MessageEvent) => any) | null;
+declare const onmessage: ((this: Window, ev: MessageEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/messageerror_event)
  */
-declare var onmessageerror: ((this: Window, ev: MessageEvent) => any) | null;
+declare const onmessageerror:
+  | ((this: Window, ev: MessageEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/offline_event)
  */
-declare var onoffline: ((this: Window, ev: Event) => any) | null;
+declare const onoffline: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/online_event)
  */
-declare var ononline: ((this: Window, ev: Event) => any) | null;
+declare const ononline: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/pagehide_event)
  */
-declare var onpagehide: ((this: Window, ev: PageTransitionEvent) => any) | null;
+declare const onpagehide:
+  | ((this: Window, ev: PageTransitionEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/pageshow_event)
  */
-declare var onpageshow: ((this: Window, ev: PageTransitionEvent) => any) | null;
+declare const onpageshow:
+  | ((this: Window, ev: PageTransitionEvent) => unknown)
+  | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/popstate_event)
  */
-declare var onpopstate: ((this: Window, ev: PopStateEvent) => any) | null;
+declare const onpopstate: ((this: Window, ev: PopStateEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/rejectionhandled_event)
  */
-declare var onrejectionhandled:
-  | ((this: Window, ev: PromiseRejectionEvent) => any)
+declare const onrejectionhandled:
+  | ((this: Window, ev: PromiseRejectionEvent) => unknown)
   | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/storage_event)
  */
-declare var onstorage: ((this: Window, ev: StorageEvent) => any) | null;
+declare const onstorage: ((this: Window, ev: StorageEvent) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/unhandledrejection_event)
  */
-declare var onunhandledrejection:
-  | ((this: Window, ev: PromiseRejectionEvent) => any)
+declare const onunhandledrejection:
+  | ((this: Window, ev: PromiseRejectionEvent) => unknown)
   | null;
 /**
  * @deprecated
@@ -44706,36 +45090,36 @@ declare var onunhandledrejection:
  *   [MDN
  *   Reference](https://developer.mozilla.org/docs/Web/API/Window/unload_event)
  */
-declare var onunload: ((this: Window, ev: Event) => any) | null;
+declare const onunload: ((this: Window, ev: Event) => unknown) | null;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage)
  */
-declare var localStorage: Storage;
+declare const localStorage: Storage;
 /**
  * Available only in secure contexts.
  *
  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/caches)
  */
-declare var caches: CacheStorage;
+declare const caches: CacheStorage;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/crossOriginIsolated)
  */
-declare var crossOriginIsolated: boolean;
+declare const crossOriginIsolated: boolean;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/crypto_property) */
-declare var crypto: Crypto;
+declare const crypto: Crypto;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/indexedDB) */
-declare var indexedDB: IDBFactory;
+declare const indexedDB: IDBFactory;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/isSecureContext) */
-declare var isSecureContext: boolean;
+declare const isSecureContext: boolean;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/origin) */
-declare var origin: string;
+declare const origin: string;
 /**
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/performance_property)
  */
-declare var performance: Performance;
+declare const performance: Performance;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/atob) */
 declare function atob(data: string): string;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/btoa) */
@@ -44765,21 +45149,21 @@ declare function fetch(
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/queueMicrotask) */
 declare function queueMicrotask(callback: VoidFunction): void;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/reportError) */
-declare function reportError(e: any): void;
+declare function reportError(e: unknown): void;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/setInterval) */
 declare function setInterval(
   handler: TimerHandler,
   timeout?: number,
-  ...arguments: any[]
+  ...arguments: readonly unknown[]
 ): number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/setTimeout) */
 declare function setTimeout(
   handler: TimerHandler,
   timeout?: number,
-  ...arguments: any[]
+  ...arguments: readonly unknown[]
 ): number;
 /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/structuredClone) */
-declare function structuredClone<T = any>(
+declare function structuredClone<T = unknown>(
   value: T,
   options?: StructuredSerializeOptions,
 ): T;
@@ -44787,10 +45171,10 @@ declare function structuredClone<T = any>(
  * [MDN
  * Reference](https://developer.mozilla.org/docs/Web/API/Window/sessionStorage)
  */
-declare var sessionStorage: Storage;
+declare const sessionStorage: Storage;
 declare function addEventListener<K extends keyof WindowEventMap>(
   type: K,
-  listener: (this: Window, ev: WindowEventMap[K]) => any,
+  listener: (this: Window, ev: WindowEventMap[K]) => unknown,
   options?: boolean | AddEventListenerOptions,
 ): void;
 declare function addEventListener(
@@ -44800,7 +45184,7 @@ declare function addEventListener(
 ): void;
 declare function removeEventListener<K extends keyof WindowEventMap>(
   type: K,
-  listener: (this: Window, ev: WindowEventMap[K]) => any,
+  listener: (this: Window, ev: WindowEventMap[K]) => unknown,
   options?: boolean | EventListenerOptions,
 ): void;
 declare function removeEventListener(
@@ -44835,16 +45219,19 @@ type CanvasImageSource =
   | OffscreenCanvas
   | VideoFrame;
 type ClipboardItemData = Promise<string | Blob>;
-type ClipboardItems = ClipboardItem[];
+type ClipboardItems = readonly ClipboardItem[];
 type ConstrainBoolean = boolean | ConstrainBooleanParameters;
-type ConstrainDOMString = string | string[] | ConstrainDOMStringParameters;
+type ConstrainDOMString =
+  | string
+  | readonly string[]
+  | ConstrainDOMStringParameters;
 type ConstrainDouble = number | ConstrainDoubleRange;
 type ConstrainULong = number | ConstrainULongRange;
 type DOMHighResTimeStamp = number;
 type EpochTimeStamp = number;
 type EventListenerOrEventListenerObject = EventListener | EventListenerObject;
 type FileSystemWriteChunkType = BufferSource | Blob | string | WriteParams;
-type Float32List = Float32Array | GLfloat[];
+type Float32List = Float32Array | readonly GLfloat[];
 type FormDataEntryValue = File | string;
 type GLbitfield = number;
 type GLboolean = boolean;
@@ -44861,10 +45248,18 @@ type GLuint64 = number;
 type HTMLOrSVGImageElement = HTMLImageElement | SVGImageElement;
 type HTMLOrSVGScriptElement = HTMLScriptElement | SVGScriptElement;
 type HashAlgorithmIdentifier = AlgorithmIdentifier;
-type HeadersInit = [string, string][] | Record<string, string> | Headers;
-type IDBValidKey = number | string | Date | BufferSource | IDBValidKey[];
+type HeadersInit =
+  | readonly (readonly [string, string])[]
+  | Record<string, string>
+  | Headers;
+type IDBValidKey =
+  | number
+  | string
+  | Date
+  | BufferSource
+  | readonly IDBValidKey[];
 type ImageBitmapSource = CanvasImageSource | Blob | ImageData;
-type Int32List = Int32Array | GLint[];
+type Int32List = Int32Array | readonly GLint[];
 type LineAndPositionSetting = number | AutoKeyword;
 type MediaProvider = MediaStream | MediaSource | Blob;
 type MessageEventSource = WindowProxy | MessagePort | ServiceWorker;
@@ -44879,7 +45274,7 @@ type OnBeforeUnloadEventHandler = OnBeforeUnloadEventHandlerNonNull | null;
 type OnErrorEventHandler = OnErrorEventHandlerNonNull | null;
 type OptionalPostfixToken<T extends string> = ` ${T}` | '';
 type OptionalPrefixToken<T extends string> = `${T} ` | '';
-type PerformanceEntryList = PerformanceEntry[];
+type PerformanceEntryList = readonly PerformanceEntry[];
 type RTCRtpTransform = RTCRtpScriptTransform;
 type ReadableStreamController<T> =
   | ReadableStreamDefaultController<T>
@@ -44895,7 +45290,7 @@ type RenderingContext =
   | ImageBitmapRenderingContext
   | WebGLRenderingContext
   | WebGL2RenderingContext;
-type ReportList = Report[];
+type ReportList = readonly Report[];
 type RequestInfo = Request | string;
 type TexImageSource =
   | ImageBitmap
@@ -44915,8 +45310,8 @@ type Transferable =
   | TransformStream
   | VideoFrame
   | ArrayBuffer;
-type Uint32List = Uint32Array | GLuint[];
-type VibratePattern = number | number[];
+type Uint32List = Uint32Array | readonly GLuint[];
+type VibratePattern = number | readonly number[];
 type WindowProxy = Window;
 type XMLHttpRequestBodyInit =
   | Blob
```
