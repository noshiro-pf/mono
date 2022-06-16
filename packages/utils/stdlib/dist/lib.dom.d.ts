/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/// <reference no-default-lib="true"/>

/////////////////////////////
/// Window APIs
/////////////////////////////

interface AddEventListenerOptions extends EventListenerOptions {
  readonly once?: boolean;
  readonly passive?: boolean;
  readonly signal?: AbortSignal;
}

interface AesCbcParams extends Algorithm {
  readonly iv: BufferSource;
}

interface AesCtrParams extends Algorithm {
  readonly counter: BufferSource;
  readonly length: number;
}

interface AesDerivedKeyParams extends Algorithm {
  readonly length: number;
}

interface AesGcmParams extends Algorithm {
  readonly additionalData?: BufferSource;
  readonly iv: BufferSource;
  readonly tagLength?: number;
}

interface AesKeyAlgorithm extends KeyAlgorithm {
  readonly length: number;
}

interface AesKeyGenParams extends Algorithm {
  readonly length: number;
}

interface Algorithm {
  readonly name: string;
}

interface AnalyserOptions extends AudioNodeOptions {
  readonly fftSize?: number;
  readonly maxDecibels?: number;
  readonly minDecibels?: number;
  readonly smoothingTimeConstant?: number;
}

interface AnimationEventInit extends EventInit {
  readonly animationName?: string;
  readonly elapsedTime?: number;
  readonly pseudoElement?: string;
}

interface AnimationPlaybackEventInit extends EventInit {
  readonly currentTime?: CSSNumberish | null;
  readonly timelineTime?: CSSNumberish | null;
}

interface AssignedNodesOptions {
  readonly flatten?: boolean;
}

interface AudioBufferOptions {
  readonly length: number;
  readonly numberOfChannels?: number;
  readonly sampleRate: number;
}

interface AudioBufferSourceOptions {
  readonly buffer?: AudioBuffer | null;
  readonly detune?: number;
  readonly loop?: boolean;
  readonly loopEnd?: number;
  readonly loopStart?: number;
  readonly playbackRate?: number;
}

interface AudioConfiguration {
  readonly bitrate?: number;
  readonly channels?: string;
  readonly contentType: string;
  readonly samplerate?: number;
  readonly spatialRendering?: boolean;
}

interface AudioContextOptions {
  readonly latencyHint?: AudioContextLatencyCategory | number;
  readonly sampleRate?: number;
}

interface AudioNodeOptions {
  readonly channelCount?: number;
  readonly channelCountMode?: ChannelCountMode;
  readonly channelInterpretation?: ChannelInterpretation;
}

interface AudioProcessingEventInit extends EventInit {
  readonly inputBuffer: AudioBuffer;
  readonly outputBuffer: AudioBuffer;
  readonly playbackTime: number;
}

interface AudioTimestamp {
  readonly contextTime?: number;
  readonly performanceTime?: DOMHighResTimeStamp;
}

interface AudioWorkletNodeOptions extends AudioNodeOptions {
  readonly numberOfInputs?: number;
  readonly numberOfOutputs?: number;
  readonly outputChannelCount?: readonly number[];
  readonly parameterData?: Record<string, number>;
  readonly processorOptions?: unknown;
}

interface AuthenticationExtensionsClientInputs {
  readonly appid?: string;
  readonly appidExclude?: string;
  readonly credProps?: boolean;
  readonly uvm?: boolean;
}

interface AuthenticationExtensionsClientOutputs {
  readonly appid?: boolean;
  readonly credProps?: CredentialPropertiesOutput;
  readonly uvm?: UvmEntries;
}

interface AuthenticatorSelectionCriteria {
  readonly authenticatorAttachment?: AuthenticatorAttachment;
  readonly requireResidentKey?: boolean;
  readonly residentKey?: ResidentKeyRequirement;
  readonly userVerification?: UserVerificationRequirement;
}

interface BiquadFilterOptions extends AudioNodeOptions {
  readonly Q?: number;
  readonly detune?: number;
  readonly frequency?: number;
  readonly gain?: number;
  readonly type?: BiquadFilterType;
}

interface BlobEventInit {
  readonly data: Blob;
  readonly timecode?: DOMHighResTimeStamp;
}

interface BlobPropertyBag {
  readonly endings?: EndingType;
  readonly type?: string;
}

interface CSSStyleSheetInit {
  readonly baseURL?: string;
  readonly disabled?: boolean;
  readonly media?: MediaList | string;
}

interface CacheQueryOptions {
  readonly ignoreMethod?: boolean;
  readonly ignoreSearch?: boolean;
  readonly ignoreVary?: boolean;
}

interface CanvasRenderingContext2DSettings {
  readonly alpha?: boolean;
  readonly colorSpace?: PredefinedColorSpace;
  readonly desynchronized?: boolean;
  readonly willReadFrequently?: boolean;
}

interface ChannelMergerOptions extends AudioNodeOptions {
  readonly numberOfInputs?: number;
}

interface ChannelSplitterOptions extends AudioNodeOptions {
  readonly numberOfOutputs?: number;
}

interface ClientQueryOptions {
  readonly includeUncontrolled?: boolean;
  readonly type?: ClientTypes;
}

interface ClipboardEventInit extends EventInit {
  readonly clipboardData?: DataTransfer | null;
}

interface ClipboardItemOptions {
  readonly presentationStyle?: PresentationStyle;
}

interface CloseEventInit extends EventInit {
  readonly code?: number;
  readonly reason?: string;
  readonly wasClean?: boolean;
}

interface CompositionEventInit extends UIEventInit {
  readonly data?: string;
}

interface ComputedEffectTiming extends EffectTiming {
  readonly activeDuration?: CSSNumberish;
  readonly currentIteration?: number | null;
  readonly endTime?: CSSNumberish;
  readonly localTime?: CSSNumberish | null;
  readonly progress?: number | null;
  readonly startTime?: CSSNumberish;
}

interface ComputedKeyframe {
  readonly composite: CompositeOperationOrAuto;
  readonly computedOffset: number;
  readonly easing: string;
  readonly offset: number | null;
  readonly [property: string]: string | number | null | undefined;
}

interface ConstantSourceOptions {
  readonly offset?: number;
}

interface ConstrainBooleanParameters {
  readonly exact?: boolean;
  readonly ideal?: boolean;
}

interface ConstrainDOMStringParameters {
  readonly exact?: string | readonly string[];
  readonly ideal?: string | readonly string[];
}

interface ConstrainDoubleRange extends DoubleRange {
  readonly exact?: number;
  readonly ideal?: number;
}

interface ConstrainULongRange extends ULongRange {
  readonly exact?: number;
  readonly ideal?: number;
}

interface ConvolverOptions extends AudioNodeOptions {
  readonly buffer?: AudioBuffer | null;
  readonly disableNormalization?: boolean;
}

interface CredentialCreationOptions {
  readonly publicKey?: PublicKeyCredentialCreationOptions;
  readonly signal?: AbortSignal;
}

interface CredentialPropertiesOutput {
  readonly rk?: boolean;
}

interface CredentialRequestOptions {
  readonly mediation?: CredentialMediationRequirement;
  readonly publicKey?: PublicKeyCredentialRequestOptions;
  readonly signal?: AbortSignal;
}

interface CryptoKeyPair {
  readonly privateKey: CryptoKey;
  readonly publicKey: CryptoKey;
}

interface CustomEventInit<T = unknown> extends EventInit {
  readonly detail?: T;
}

interface DOMMatrix2DInit {
  readonly a?: number;
  readonly b?: number;
  readonly c?: number;
  readonly d?: number;
  readonly e?: number;
  readonly f?: number;
  readonly m11?: number;
  readonly m12?: number;
  readonly m21?: number;
  readonly m22?: number;
  readonly m41?: number;
  readonly m42?: number;
}

interface DOMMatrixInit extends DOMMatrix2DInit {
  readonly is2D?: boolean;
  readonly m13?: number;
  readonly m14?: number;
  readonly m23?: number;
  readonly m24?: number;
  readonly m31?: number;
  readonly m32?: number;
  readonly m33?: number;
  readonly m34?: number;
  readonly m43?: number;
  readonly m44?: number;
}

interface DOMPointInit {
  readonly w?: number;
  readonly x?: number;
  readonly y?: number;
  readonly z?: number;
}

interface DOMQuadInit {
  readonly p1?: DOMPointInit;
  readonly p2?: DOMPointInit;
  readonly p3?: DOMPointInit;
  readonly p4?: DOMPointInit;
}

interface DOMRectInit {
  readonly height?: number;
  readonly width?: number;
  readonly x?: number;
  readonly y?: number;
}

interface DelayOptions extends AudioNodeOptions {
  readonly delayTime?: number;
  readonly maxDelayTime?: number;
}

interface DeviceMotionEventAccelerationInit {
  readonly x?: number | null;
  readonly y?: number | null;
  readonly z?: number | null;
}

interface DeviceMotionEventInit extends EventInit {
  readonly acceleration?: DeviceMotionEventAccelerationInit;
  readonly accelerationIncludingGravity?: DeviceMotionEventAccelerationInit;
  readonly interval?: number;
  readonly rotationRate?: DeviceMotionEventRotationRateInit;
}

interface DeviceMotionEventRotationRateInit {
  readonly alpha?: number | null;
  readonly beta?: number | null;
  readonly gamma?: number | null;
}

interface DeviceOrientationEventInit extends EventInit {
  readonly absolute?: boolean;
  readonly alpha?: number | null;
  readonly beta?: number | null;
  readonly gamma?: number | null;
}

interface DisplayMediaStreamConstraints {
  readonly audio?: boolean | MediaTrackConstraints;
  readonly video?: boolean | MediaTrackConstraints;
}

interface DocumentTimelineOptions {
  readonly originTime?: DOMHighResTimeStamp;
}

interface DoubleRange {
  readonly max?: number;
  readonly min?: number;
}

interface DragEventInit extends MouseEventInit {
  readonly dataTransfer?: DataTransfer | null;
}

interface DynamicsCompressorOptions extends AudioNodeOptions {
  readonly attack?: number;
  readonly knee?: number;
  readonly ratio?: number;
  readonly release?: number;
  readonly threshold?: number;
}

interface EcKeyAlgorithm extends KeyAlgorithm {
  readonly namedCurve: NamedCurve;
}

interface EcKeyGenParams extends Algorithm {
  readonly namedCurve: NamedCurve;
}

interface EcKeyImportParams extends Algorithm {
  readonly namedCurve: NamedCurve;
}

interface EcdhKeyDeriveParams extends Algorithm {
  readonly public: CryptoKey;
}

interface EcdsaParams extends Algorithm {
  readonly hash: HashAlgorithmIdentifier;
}

interface EffectTiming {
  readonly delay?: number;
  readonly direction?: PlaybackDirection;
  readonly duration?: number | string;
  readonly easing?: string;
  readonly endDelay?: number;
  readonly fill?: FillMode;
  readonly iterationStart?: number;
  readonly iterations?: number;
  readonly playbackRate?: number;
}

interface ElementCreationOptions {
  readonly is?: string;
}

interface ElementDefinitionOptions {
  readonly extends?: string;
}

interface ErrorEventInit extends EventInit {
  readonly colno?: number;
  readonly error?: unknown;
  readonly filename?: string;
  readonly lineno?: number;
  readonly message?: string;
}

interface EventInit {
  readonly bubbles?: boolean;
  readonly cancelable?: boolean;
  readonly composed?: boolean;
}

interface EventListenerOptions {
  readonly capture?: boolean;
}

interface EventModifierInit extends UIEventInit {
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly modifierAltGraph?: boolean;
  readonly modifierCapsLock?: boolean;
  readonly modifierFn?: boolean;
  readonly modifierFnLock?: boolean;
  readonly modifierHyper?: boolean;
  readonly modifierNumLock?: boolean;
  readonly modifierScrollLock?: boolean;
  readonly modifierSuper?: boolean;
  readonly modifierSymbol?: boolean;
  readonly modifierSymbolLock?: boolean;
  readonly shiftKey?: boolean;
}

interface EventSourceInit {
  readonly withCredentials?: boolean;
}

interface FilePropertyBag extends BlobPropertyBag {
  readonly lastModified?: number;
}

interface FileSystemFlags {
  readonly create?: boolean;
  readonly exclusive?: boolean;
}

interface FileSystemGetDirectoryOptions {
  readonly create?: boolean;
}

interface FileSystemGetFileOptions {
  readonly create?: boolean;
}

interface FileSystemRemoveOptions {
  readonly recursive?: boolean;
}

interface FocusEventInit extends UIEventInit {
  readonly relatedTarget?: EventTarget | null;
}

interface FocusOptions {
  readonly preventScroll?: boolean;
}

interface FontFaceDescriptors {
  readonly display?: string;
  readonly featureSettings?: string;
  readonly stretch?: string;
  readonly style?: string;
  readonly unicodeRange?: string;
  readonly variant?: string;
  readonly weight?: string;
}

interface FontFaceSetLoadEventInit extends EventInit {
  readonly fontfaces?: readonly FontFace[];
}

interface FormDataEventInit extends EventInit {
  readonly formData: FormData;
}

interface FullscreenOptions {
  readonly navigationUI?: FullscreenNavigationUI;
}

interface GainOptions extends AudioNodeOptions {
  readonly gain?: number;
}

interface GamepadEventInit extends EventInit {
  readonly gamepad: Gamepad;
}

interface GetAnimationsOptions {
  readonly subtree?: boolean;
}

interface GetNotificationOptions {
  readonly tag?: string;
}

interface GetRootNodeOptions {
  readonly composed?: boolean;
}

interface HashChangeEventInit extends EventInit {
  readonly newURL?: string;
  readonly oldURL?: string;
}

interface HkdfParams extends Algorithm {
  readonly hash: HashAlgorithmIdentifier;
  readonly info: BufferSource;
  readonly salt: BufferSource;
}

interface HmacImportParams extends Algorithm {
  readonly hash: HashAlgorithmIdentifier;
  readonly length?: number;
}

interface HmacKeyAlgorithm extends KeyAlgorithm {
  readonly hash: KeyAlgorithm;
  readonly length: number;
}

interface HmacKeyGenParams extends Algorithm {
  readonly hash: HashAlgorithmIdentifier;
  readonly length?: number;
}

interface IDBDatabaseInfo {
  readonly name?: string;
  readonly version?: number;
}

interface IDBIndexParameters {
  readonly multiEntry?: boolean;
  readonly unique?: boolean;
}

interface IDBObjectStoreParameters {
  readonly autoIncrement?: boolean;
  readonly keyPath?: string | readonly string[] | null;
}

interface IDBVersionChangeEventInit extends EventInit {
  readonly newVersion?: number | null;
  readonly oldVersion?: number;
}

interface IIRFilterOptions extends AudioNodeOptions {
  readonly feedback: readonly number[];
  readonly feedforward: readonly number[];
}

interface IdleRequestOptions {
  readonly timeout?: number;
}

interface ImageBitmapOptions {
  readonly colorSpaceConversion?: ColorSpaceConversion;
  readonly imageOrientation?: ImageOrientation;
  readonly premultiplyAlpha?: PremultiplyAlpha;
  readonly resizeHeight?: number;
  readonly resizeQuality?: ResizeQuality;
  readonly resizeWidth?: number;
}

interface ImageBitmapRenderingContextSettings {
  readonly alpha?: boolean;
}

interface ImageDataSettings {
  readonly colorSpace?: PredefinedColorSpace;
}

interface ImportMeta {
  readonly url: string;
}

interface InputEventInit extends UIEventInit {
  readonly data?: string | null;
  readonly dataTransfer?: DataTransfer | null;
  readonly inputType?: string;
  readonly isComposing?: boolean;
  readonly targetRanges?: readonly StaticRange[];
}

interface IntersectionObserverEntryInit {
  readonly boundingClientRect: DOMRectInit;
  readonly intersectionRatio: number;
  readonly intersectionRect: DOMRectInit;
  readonly isIntersecting: boolean;
  readonly rootBounds: DOMRectInit | null;
  readonly target: Element;
  readonly time: DOMHighResTimeStamp;
}

interface IntersectionObserverInit {
  readonly root?: Element | Document | null;
  readonly rootMargin?: string;
  readonly threshold?: number | readonly number[];
}

interface JsonWebKey {
  readonly alg?: string;
  readonly crv?: string;
  readonly d?: string;
  readonly dp?: string;
  readonly dq?: string;
  readonly e?: string;
  readonly ext?: boolean;
  readonly k?: string;
  readonly key_ops?: readonly string[];
  readonly kty?: string;
  readonly n?: string;
  readonly oth?: readonly RsaOtherPrimesInfo[];
  readonly p?: string;
  readonly q?: string;
  readonly qi?: string;
  readonly use?: string;
  readonly x?: string;
  readonly y?: string;
}

interface KeyAlgorithm {
  readonly name: string;
}

interface KeyboardEventInit extends EventModifierInit {
  /** @deprecated */
  readonly charCode?: number;
  readonly code?: string;
  readonly isComposing?: boolean;
  readonly key?: string;
  /** @deprecated */
  readonly keyCode?: number;
  readonly location?: number;
  readonly repeat?: boolean;
}

interface Keyframe {
  readonly composite?: CompositeOperationOrAuto;
  readonly easing?: string;
  readonly offset?: number | null;
  readonly [property: string]: string | number | null | undefined;
}

interface KeyframeAnimationOptions extends KeyframeEffectOptions {
  readonly id?: string;
}

interface KeyframeEffectOptions extends EffectTiming {
  readonly composite?: CompositeOperation;
  readonly iterationComposite?: IterationCompositeOperation;
  readonly pseudoElement?: string | null;
}

interface LockInfo {
  readonly clientId?: string;
  readonly mode?: LockMode;
  readonly name?: string;
}

interface LockManagerSnapshot {
  readonly held?: readonly LockInfo[];
  readonly pending?: readonly LockInfo[];
}

interface LockOptions {
  readonly ifAvailable?: boolean;
  readonly mode?: LockMode;
  readonly signal?: AbortSignal;
  readonly steal?: boolean;
}

interface MIDIConnectionEventInit extends EventInit {
  readonly port?: MIDIPort;
}

interface MIDIMessageEventInit extends EventInit {
  readonly data?: Uint8Array;
}

interface MIDIOptions {
  readonly software?: boolean;
  readonly sysex?: boolean;
}

interface MediaCapabilitiesDecodingInfo extends MediaCapabilitiesInfo {
  readonly configuration?: MediaDecodingConfiguration;
}

interface MediaCapabilitiesEncodingInfo extends MediaCapabilitiesInfo {
  readonly configuration?: MediaEncodingConfiguration;
}

interface MediaCapabilitiesInfo {
  readonly powerEfficient: boolean;
  readonly smooth: boolean;
  readonly supported: boolean;
}

interface MediaConfiguration {
  readonly audio?: AudioConfiguration;
  readonly video?: VideoConfiguration;
}

interface MediaDecodingConfiguration extends MediaConfiguration {
  readonly type: MediaDecodingType;
}

interface MediaElementAudioSourceOptions {
  readonly mediaElement: HTMLMediaElement;
}

interface MediaEncodingConfiguration extends MediaConfiguration {
  readonly type: MediaEncodingType;
}

interface MediaEncryptedEventInit extends EventInit {
  readonly initData?: ArrayBuffer | null;
  readonly initDataType?: string;
}

interface MediaImage {
  readonly sizes?: string;
  readonly src: string;
  readonly type?: string;
}

interface MediaKeyMessageEventInit extends EventInit {
  readonly message: ArrayBuffer;
  readonly messageType: MediaKeyMessageType;
}

interface MediaKeySystemConfiguration {
  readonly audioCapabilities?: readonly MediaKeySystemMediaCapability[];
  readonly distinctiveIdentifier?: MediaKeysRequirement;
  readonly initDataTypes?: readonly string[];
  readonly label?: string;
  readonly persistentState?: MediaKeysRequirement;
  readonly sessionTypes?: readonly string[];
  readonly videoCapabilities?: readonly MediaKeySystemMediaCapability[];
}

interface MediaKeySystemMediaCapability {
  readonly contentType?: string;
  readonly encryptionScheme?: string | null;
  readonly robustness?: string;
}

interface MediaMetadataInit {
  readonly album?: string;
  readonly artist?: string;
  readonly artwork?: readonly MediaImage[];
  readonly title?: string;
}

interface MediaPositionState {
  readonly duration?: number;
  readonly playbackRate?: number;
  readonly position?: number;
}

interface MediaQueryListEventInit extends EventInit {
  readonly matches?: boolean;
  readonly media?: string;
}

interface MediaRecorderErrorEventInit extends EventInit {
  readonly error: DOMException;
}

interface MediaRecorderOptions {
  readonly audioBitsPerSecond?: number;
  readonly bitsPerSecond?: number;
  readonly mimeType?: string;
  readonly videoBitsPerSecond?: number;
}

interface MediaSessionActionDetails {
  readonly action: MediaSessionAction;
  readonly fastSeek?: boolean | null;
  readonly seekOffset?: number | null;
  readonly seekTime?: number | null;
}

interface MediaStreamAudioSourceOptions {
  readonly mediaStream: MediaStream;
}

interface MediaStreamConstraints {
  readonly audio?: boolean | MediaTrackConstraints;
  readonly peerIdentity?: string;
  readonly preferCurrentTab?: boolean;
  readonly video?: boolean | MediaTrackConstraints;
}

interface MediaStreamTrackEventInit extends EventInit {
  readonly track: MediaStreamTrack;
}

interface MediaTrackCapabilities {
  readonly aspectRatio?: DoubleRange;
  readonly autoGainControl?: readonly boolean[];
  readonly channelCount?: ULongRange;
  readonly cursor?: readonly string[];
  readonly deviceId?: string;
  readonly displaySurface?: string;
  readonly echoCancellation?: readonly boolean[];
  readonly facingMode?: readonly string[];
  readonly frameRate?: DoubleRange;
  readonly groupId?: string;
  readonly height?: ULongRange;
  readonly latency?: DoubleRange;
  readonly logicalSurface?: boolean;
  readonly noiseSuppression?: readonly boolean[];
  readonly resizeMode?: readonly string[];
  readonly sampleRate?: ULongRange;
  readonly sampleSize?: ULongRange;
  readonly width?: ULongRange;
}

interface MediaTrackConstraintSet {
  readonly aspectRatio?: ConstrainDouble;
  readonly autoGainControl?: ConstrainBoolean;
  readonly channelCount?: ConstrainULong;
  readonly deviceId?: ConstrainDOMString;
  readonly echoCancellation?: ConstrainBoolean;
  readonly facingMode?: ConstrainDOMString;
  readonly frameRate?: ConstrainDouble;
  readonly groupId?: ConstrainDOMString;
  readonly height?: ConstrainULong;
  readonly latency?: ConstrainDouble;
  readonly noiseSuppression?: ConstrainBoolean;
  readonly sampleRate?: ConstrainULong;
  readonly sampleSize?: ConstrainULong;
  readonly suppressLocalAudioPlayback?: ConstrainBoolean;
  readonly width?: ConstrainULong;
}

interface MediaTrackConstraints extends MediaTrackConstraintSet {
  readonly advanced?: readonly MediaTrackConstraintSet[];
}

interface MediaTrackSettings {
  readonly aspectRatio?: number;
  readonly autoGainControl?: boolean;
  readonly deviceId?: string;
  readonly echoCancellation?: boolean;
  readonly facingMode?: string;
  readonly frameRate?: number;
  readonly groupId?: string;
  readonly height?: number;
  readonly noiseSuppression?: boolean;
  readonly restrictOwnAudio?: boolean;
  readonly sampleRate?: number;
  readonly sampleSize?: number;
  readonly width?: number;
}

interface MediaTrackSupportedConstraints {
  readonly aspectRatio?: boolean;
  readonly autoGainControl?: boolean;
  readonly deviceId?: boolean;
  readonly echoCancellation?: boolean;
  readonly facingMode?: boolean;
  readonly frameRate?: boolean;
  readonly groupId?: boolean;
  readonly height?: boolean;
  readonly noiseSuppression?: boolean;
  readonly sampleRate?: boolean;
  readonly sampleSize?: boolean;
  readonly suppressLocalAudioPlayback?: boolean;
  readonly width?: boolean;
}

interface MessageEventInit<T = unknown> extends EventInit {
  readonly data?: T;
  readonly lastEventId?: string;
  readonly origin?: string;
  readonly ports?: readonly MessagePort[];
  readonly source?: MessageEventSource | null;
}

interface MouseEventInit extends EventModifierInit {
  readonly button?: number;
  readonly buttons?: number;
  readonly clientX?: number;
  readonly clientY?: number;
  readonly movementX?: number;
  readonly movementY?: number;
  readonly relatedTarget?: EventTarget | null;
  readonly screenX?: number;
  readonly screenY?: number;
}

interface MultiCacheQueryOptions extends CacheQueryOptions {
  readonly cacheName?: string;
}

interface MutationObserverInit {
  /** Set to a list of attribute local names (without namespace) if not all attribute mutations need to be observed and attributes is true or omitted. */
  readonly attributeFilter?: readonly string[];
  /** Set to true if attributes is true or omitted and target's attribute value before the mutation needs to be recorded. */
  readonly attributeOldValue?: boolean;
  /** Set to true if mutations to target's attributes are to be observed. Can be omitted if attributeOldValue or attributeFilter is specified. */
  readonly attributes?: boolean;
  /** Set to true if mutations to target's data are to be observed. Can be omitted if characterDataOldValue is specified. */
  readonly characterData?: boolean;
  /** Set to true if characterData is set to true or omitted and target's data before the mutation needs to be recorded. */
  readonly characterDataOldValue?: boolean;
  /** Set to true if mutations to target's children are to be observed. */
  readonly childList?: boolean;
  /** Set to true if mutations to not just target, but also target's descendants are to be observed. */
  readonly subtree?: boolean;
}

interface NavigationPreloadState {
  readonly enabled?: boolean;
  readonly headerValue?: string;
}

interface NotificationAction {
  readonly action: string;
  readonly icon?: string;
  readonly title: string;
}

interface NotificationOptions {
  readonly actions?: readonly NotificationAction[];
  readonly badge?: string;
  readonly body?: string;
  readonly data?: unknown;
  readonly dir?: NotificationDirection;
  readonly icon?: string;
  readonly image?: string;
  readonly lang?: string;
  readonly renotify?: boolean;
  readonly requireInteraction?: boolean;
  readonly silent?: boolean;
  readonly tag?: string;
  readonly timestamp?: EpochTimeStamp;
  readonly vibrate?: VibratePattern;
}

interface OfflineAudioCompletionEventInit extends EventInit {
  readonly renderedBuffer: AudioBuffer;
}

interface OfflineAudioContextOptions {
  readonly length: number;
  readonly numberOfChannels?: number;
  readonly sampleRate: number;
}

interface OptionalEffectTiming {
  readonly delay?: number;
  readonly direction?: PlaybackDirection;
  readonly duration?: number | string;
  readonly easing?: string;
  readonly endDelay?: number;
  readonly fill?: FillMode;
  readonly iterationStart?: number;
  readonly iterations?: number;
  readonly playbackRate?: number;
}

interface OscillatorOptions extends AudioNodeOptions {
  readonly detune?: number;
  readonly frequency?: number;
  readonly periodicWave?: PeriodicWave;
  readonly type?: OscillatorType;
}

interface PageTransitionEventInit extends EventInit {
  readonly persisted?: boolean;
}

interface PannerOptions extends AudioNodeOptions {
  readonly coneInnerAngle?: number;
  readonly coneOuterAngle?: number;
  readonly coneOuterGain?: number;
  readonly distanceModel?: DistanceModelType;
  readonly maxDistance?: number;
  readonly orientationX?: number;
  readonly orientationY?: number;
  readonly orientationZ?: number;
  readonly panningModel?: PanningModelType;
  readonly positionX?: number;
  readonly positionY?: number;
  readonly positionZ?: number;
  readonly refDistance?: number;
  readonly rolloffFactor?: number;
}

interface PaymentCurrencyAmount {
  readonly currency: string;
  readonly value: string;
}

interface PaymentDetailsBase {
  readonly displayItems?: readonly PaymentItem[];
  readonly modifiers?: readonly PaymentDetailsModifier[];
}

interface PaymentDetailsInit extends PaymentDetailsBase {
  readonly id?: string;
  readonly total: PaymentItem;
}

interface PaymentDetailsModifier {
  readonly additionalDisplayItems?: readonly PaymentItem[];
  readonly data?: unknown;
  readonly supportedMethods: string;
  readonly total?: PaymentItem;
}

interface PaymentDetailsUpdate extends PaymentDetailsBase {
  readonly paymentMethodErrors?: unknown;
  readonly total?: PaymentItem;
}

interface PaymentItem {
  readonly amount: PaymentCurrencyAmount;
  readonly label: string;
  readonly pending?: boolean;
}

interface PaymentMethodChangeEventInit extends PaymentRequestUpdateEventInit {
  readonly methodDetails?: unknown;
  readonly methodName?: string;
}

interface PaymentMethodData {
  readonly data?: unknown;
  readonly supportedMethods: string;
}

interface PaymentRequestUpdateEventInit extends EventInit {}

interface PaymentValidationErrors {
  readonly error?: string;
  readonly paymentMethod?: unknown;
}

interface Pbkdf2Params extends Algorithm {
  readonly hash: HashAlgorithmIdentifier;
  readonly iterations: number;
  readonly salt: BufferSource;
}

interface PerformanceMarkOptions {
  readonly detail?: unknown;
  readonly startTime?: DOMHighResTimeStamp;
}

interface PerformanceMeasureOptions {
  readonly detail?: unknown;
  readonly duration?: DOMHighResTimeStamp;
  readonly end?: string | DOMHighResTimeStamp;
  readonly start?: string | DOMHighResTimeStamp;
}

interface PerformanceObserverInit {
  readonly buffered?: boolean;
  readonly entryTypes?: readonly string[];
  readonly type?: string;
}

interface PeriodicWaveConstraints {
  readonly disableNormalization?: boolean;
}

interface PeriodicWaveOptions extends PeriodicWaveConstraints {
  readonly imag?: readonly number[] | Float32Array;
  readonly real?: readonly number[] | Float32Array;
}

interface PermissionDescriptor {
  readonly name: PermissionName;
}

interface PointerEventInit extends MouseEventInit {
  readonly coalescedEvents?: readonly PointerEvent[];
  readonly height?: number;
  readonly isPrimary?: boolean;
  readonly pointerId?: number;
  readonly pointerType?: string;
  readonly predictedEvents?: readonly PointerEvent[];
  readonly pressure?: number;
  readonly tangentialPressure?: number;
  readonly tiltX?: number;
  readonly tiltY?: number;
  readonly twist?: number;
  readonly width?: number;
}

interface PopStateEventInit extends EventInit {
  readonly state?: unknown;
}

interface PositionOptions {
  readonly enableHighAccuracy?: boolean;
  readonly maximumAge?: number;
  readonly timeout?: number;
}

interface ProgressEventInit extends EventInit {
  readonly lengthComputable?: boolean;
  readonly loaded?: number;
  readonly total?: number;
}

interface PromiseRejectionEventInit extends EventInit {
  readonly promise: Promise<unknown>;
  readonly reason?: unknown;
}

interface PropertyIndexedKeyframes {
  readonly composite?:
    | CompositeOperationOrAuto
    | readonly CompositeOperationOrAuto[];
  readonly easing?: string | readonly string[];
  readonly offset?: number | readonly (number | null)[];
  readonly [property: string]:
    | string
    | readonly string[]
    | number
    | null
    | readonly (number | null)[]
    | undefined;
}

interface PublicKeyCredentialCreationOptions {
  readonly attestation?: AttestationConveyancePreference;
  readonly authenticatorSelection?: AuthenticatorSelectionCriteria;
  readonly challenge: BufferSource;
  readonly excludeCredentials?: readonly PublicKeyCredentialDescriptor[];
  readonly extensions?: AuthenticationExtensionsClientInputs;
  readonly pubKeyCredParams: readonly PublicKeyCredentialParameters[];
  readonly rp: PublicKeyCredentialRpEntity;
  readonly timeout?: number;
  readonly user: PublicKeyCredentialUserEntity;
}

interface PublicKeyCredentialDescriptor {
  readonly id: BufferSource;
  readonly transports?: readonly AuthenticatorTransport[];
  readonly type: PublicKeyCredentialType;
}

interface PublicKeyCredentialEntity {
  readonly name: string;
}

interface PublicKeyCredentialParameters {
  readonly alg: COSEAlgorithmIdentifier;
  readonly type: PublicKeyCredentialType;
}

interface PublicKeyCredentialRequestOptions {
  readonly allowCredentials?: readonly PublicKeyCredentialDescriptor[];
  readonly challenge: BufferSource;
  readonly extensions?: AuthenticationExtensionsClientInputs;
  readonly rpId?: string;
  readonly timeout?: number;
  readonly userVerification?: UserVerificationRequirement;
}

interface PublicKeyCredentialRpEntity extends PublicKeyCredentialEntity {
  readonly id?: string;
}

interface PublicKeyCredentialUserEntity extends PublicKeyCredentialEntity {
  readonly displayName: string;
  readonly id: BufferSource;
}

interface PushSubscriptionJSON {
  readonly endpoint?: string;
  readonly expirationTime?: EpochTimeStamp | null;
  readonly keys?: Record<string, string>;
}

interface PushSubscriptionOptionsInit {
  readonly applicationServerKey?: BufferSource | string | null;
  readonly userVisibleOnly?: boolean;
}

interface QueuingStrategy<T = unknown> {
  readonly highWaterMark?: number;
  readonly size?: QueuingStrategySize<T>;
}

interface QueuingStrategyInit {
  /**
   * Creates a new ByteLengthQueuingStrategy with the provided high water mark.
   *
   * Note that the provided high water mark will not be validated ahead of time. Instead, if it is negative, NaN, or not a number, the resulting ByteLengthQueuingStrategy will cause the corresponding stream constructor to throw.
   */
  readonly highWaterMark: number;
}

interface RTCAnswerOptions extends RTCOfferAnswerOptions {}

interface RTCCertificateExpiration {
  readonly expires?: number;
}

interface RTCConfiguration {
  readonly bundlePolicy?: RTCBundlePolicy;
  readonly certificates?: readonly RTCCertificate[];
  readonly iceCandidatePoolSize?: number;
  readonly iceServers?: readonly RTCIceServer[];
  readonly iceTransportPolicy?: RTCIceTransportPolicy;
  readonly rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

interface RTCDTMFToneChangeEventInit extends EventInit {
  readonly tone?: string;
}

interface RTCDataChannelEventInit extends EventInit {
  readonly channel: RTCDataChannel;
}

interface RTCDataChannelInit {
  readonly id?: number;
  readonly maxPacketLifeTime?: number;
  readonly maxRetransmits?: number;
  readonly negotiated?: boolean;
  readonly ordered?: boolean;
  readonly protocol?: string;
}

interface RTCDtlsFingerprint {
  readonly algorithm?: string;
  readonly value?: string;
}

interface RTCEncodedAudioFrameMetadata {
  readonly contributingSources?: readonly number[];
  readonly synchronizationSource?: number;
}

interface RTCEncodedVideoFrameMetadata {
  readonly contributingSources?: readonly number[];
  readonly dependencies?: readonly number[];
  readonly frameId?: number;
  readonly height?: number;
  readonly spatialIndex?: number;
  readonly synchronizationSource?: number;
  readonly temporalIndex?: number;
  readonly width?: number;
}

interface RTCErrorEventInit extends EventInit {
  readonly error: RTCError;
}

interface RTCErrorInit {
  readonly errorDetail: RTCErrorDetailType;
  readonly httpRequestStatusCode?: number;
  readonly receivedAlert?: number;
  readonly sctpCauseCode?: number;
  readonly sdpLineNumber?: number;
  readonly sentAlert?: number;
}

interface RTCIceCandidateInit {
  readonly candidate?: string;
  readonly sdpMLineIndex?: number | null;
  readonly sdpMid?: string | null;
  readonly usernameFragment?: string | null;
}

interface RTCIceCandidatePairStats extends RTCStats {
  readonly availableIncomingBitrate?: number;
  readonly availableOutgoingBitrate?: number;
  readonly bytesReceived?: number;
  readonly bytesSent?: number;
  readonly currentRoundTripTime?: number;
  readonly localCandidateId: string;
  readonly nominated?: boolean;
  readonly remoteCandidateId: string;
  readonly requestsReceived?: number;
  readonly requestsSent?: number;
  readonly responsesReceived?: number;
  readonly responsesSent?: number;
  readonly state: RTCStatsIceCandidatePairState;
  readonly totalRoundTripTime?: number;
  readonly transportId: string;
}

interface RTCIceServer {
  readonly credential?: string;
  readonly credentialType?: RTCIceCredentialType;
  readonly urls: string | readonly string[];
  readonly username?: string;
}

interface RTCInboundRtpStreamStats extends RTCReceivedRtpStreamStats {
  readonly firCount?: number;
  readonly framesDecoded?: number;
  readonly nackCount?: number;
  readonly pliCount?: number;
  readonly qpSum?: number;
  readonly remoteId?: string;
}

interface RTCLocalSessionDescriptionInit {
  readonly sdp?: string;
  readonly type?: RTCSdpType;
}

interface RTCOfferAnswerOptions {}

interface RTCOfferOptions extends RTCOfferAnswerOptions {
  readonly iceRestart?: boolean;
  readonly offerToReceiveAudio?: boolean;
  readonly offerToReceiveVideo?: boolean;
}

interface RTCOutboundRtpStreamStats extends RTCSentRtpStreamStats {
  readonly firCount?: number;
  readonly framesEncoded?: number;
  readonly nackCount?: number;
  readonly pliCount?: number;
  readonly qpSum?: number;
  readonly remoteId?: string;
}

interface RTCPeerConnectionIceErrorEventInit extends EventInit {
  readonly address?: string | null;
  readonly errorCode: number;
  readonly errorText?: string;
  readonly port?: number | null;
  readonly url?: string;
}

interface RTCPeerConnectionIceEventInit extends EventInit {
  readonly candidate?: RTCIceCandidate | null;
  readonly url?: string | null;
}

interface RTCReceivedRtpStreamStats extends RTCRtpStreamStats {
  readonly jitter?: number;
  readonly packetsDiscarded?: number;
  readonly packetsLost?: number;
  readonly packetsReceived?: number;
}

interface RTCRtcpParameters {
  readonly cname?: string;
  readonly reducedSize?: boolean;
}

interface RTCRtpCapabilities {
  readonly codecs: readonly RTCRtpCodecCapability[];
  readonly headerExtensions: readonly RTCRtpHeaderExtensionCapability[];
}

interface RTCRtpCodecCapability {
  readonly channels?: number;
  readonly clockRate: number;
  readonly mimeType: string;
  readonly sdpFmtpLine?: string;
}

interface RTCRtpCodecParameters {
  readonly channels?: number;
  readonly clockRate: number;
  readonly mimeType: string;
  readonly payloadType: number;
  readonly sdpFmtpLine?: string;
}

interface RTCRtpCodingParameters {
  readonly rid?: string;
}

interface RTCRtpContributingSource {
  readonly audioLevel?: number;
  readonly rtpTimestamp: number;
  readonly source: number;
  readonly timestamp: DOMHighResTimeStamp;
}

interface RTCRtpEncodingParameters extends RTCRtpCodingParameters {
  readonly active?: boolean;
  readonly maxBitrate?: number;
  readonly priority?: RTCPriorityType;
  readonly scaleResolutionDownBy?: number;
}

interface RTCRtpHeaderExtensionCapability {
  readonly uri?: string;
}

interface RTCRtpHeaderExtensionParameters {
  readonly encrypted?: boolean;
  readonly id: number;
  readonly uri: string;
}

interface RTCRtpParameters {
  readonly codecs: readonly RTCRtpCodecParameters[];
  readonly headerExtensions: readonly RTCRtpHeaderExtensionParameters[];
  readonly rtcp: RTCRtcpParameters;
}

interface RTCRtpReceiveParameters extends RTCRtpParameters {}

interface RTCRtpSendParameters extends RTCRtpParameters {
  readonly degradationPreference?: RTCDegradationPreference;
  readonly encodings: readonly RTCRtpEncodingParameters[];
  readonly transactionId: string;
}

interface RTCRtpStreamStats extends RTCStats {
  readonly codecId?: string;
  readonly kind: string;
  readonly ssrc: number;
  readonly transportId?: string;
}

interface RTCRtpSynchronizationSource extends RTCRtpContributingSource {}

interface RTCRtpTransceiverInit {
  readonly direction?: RTCRtpTransceiverDirection;
  readonly sendEncodings?: readonly RTCRtpEncodingParameters[];
  readonly streams?: readonly MediaStream[];
}

interface RTCSentRtpStreamStats extends RTCRtpStreamStats {
  readonly bytesSent?: number;
  readonly packetsSent?: number;
}

interface RTCSessionDescriptionInit {
  readonly sdp?: string;
  readonly type: RTCSdpType;
}

interface RTCStats {
  readonly id: string;
  readonly timestamp: DOMHighResTimeStamp;
  readonly type: RTCStatsType;
}

interface RTCTrackEventInit extends EventInit {
  readonly receiver: RTCRtpReceiver;
  readonly streams?: readonly MediaStream[];
  readonly track: MediaStreamTrack;
  readonly transceiver: RTCRtpTransceiver;
}

interface RTCTransportStats extends RTCStats {
  readonly bytesReceived?: number;
  readonly bytesSent?: number;
  readonly dtlsCipher?: string;
  readonly dtlsState: RTCDtlsTransportState;
  readonly localCertificateId?: string;
  readonly remoteCertificateId?: string;
  readonly rtcpTransportStatsId?: string;
  readonly selectedCandidatePairId?: string;
  readonly srtpCipher?: string;
  readonly tlsVersion?: string;
}

interface ReadableStreamDefaultReadDoneResult {
  readonly done: true;
  readonly value?: undefined;
}

interface ReadableStreamDefaultReadValueResult<T> {
  readonly done: false;
  readonly value: T;
}

interface ReadableWritablePair<R = unknown, W = unknown> {
  readonly readable: ReadableStream<R>;
  /**
   * Provides a convenient, chainable way of piping this readable stream through a transform stream (or any other { writable, readable } pair). It simply pipes the stream into the writable side of the supplied pair, and returns the readable side for further use.
   *
   * Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader.
   */
  readonly writable: WritableStream<W>;
}

interface RegistrationOptions {
  readonly scope?: string;
  readonly type?: WorkerType;
  readonly updateViaCache?: ServiceWorkerUpdateViaCache;
}

interface RequestInit {
  /** A BodyInit object or null to set request's body. */
  readonly body?: BodyInit | null;
  /** A string indicating how the request will interact with the browser's cache to set request's cache. */
  readonly cache?: RequestCache;
  /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
  readonly credentials?: RequestCredentials;
  /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
  readonly headers?: HeadersInit;
  /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
  readonly integrity?: string;
  /** A boolean to set request's keepalive. */
  readonly keepalive?: boolean;
  /** A string to set request's method. */
  readonly method?: string;
  /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
  readonly mode?: RequestMode;
  /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
  readonly redirect?: RequestRedirect;
  /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
  readonly referrer?: string;
  /** A referrer policy to set request's referrerPolicy. */
  readonly referrerPolicy?: ReferrerPolicy;
  /** An AbortSignal to set request's signal. */
  readonly signal?: AbortSignal | null;
  /** Can only be null. Used to disassociate request from any Window. */
  readonly window?: null;
}

interface ResizeObserverOptions {
  readonly box?: ResizeObserverBoxOptions;
}

interface ResponseInit {
  readonly headers?: HeadersInit;
  readonly status?: number;
  readonly statusText?: string;
}

interface RsaHashedImportParams extends Algorithm {
  readonly hash: HashAlgorithmIdentifier;
}

interface RsaHashedKeyAlgorithm extends RsaKeyAlgorithm {
  readonly hash: KeyAlgorithm;
}

interface RsaHashedKeyGenParams extends RsaKeyGenParams {
  readonly hash: HashAlgorithmIdentifier;
}

interface RsaKeyAlgorithm extends KeyAlgorithm {
  readonly modulusLength: number;
  readonly publicExponent: BigInteger;
}

interface RsaKeyGenParams extends Algorithm {
  readonly modulusLength: number;
  readonly publicExponent: BigInteger;
}

interface RsaOaepParams extends Algorithm {
  readonly label?: BufferSource;
}

interface RsaOtherPrimesInfo {
  readonly d?: string;
  readonly r?: string;
  readonly t?: string;
}

interface RsaPssParams extends Algorithm {
  readonly saltLength: number;
}

interface SVGBoundingBoxOptions {
  readonly clipped?: boolean;
  readonly fill?: boolean;
  readonly markers?: boolean;
  readonly stroke?: boolean;
}

interface ScrollIntoViewOptions extends ScrollOptions {
  readonly block?: ScrollLogicalPosition;
  readonly inline?: ScrollLogicalPosition;
}

interface ScrollOptions {
  readonly behavior?: ScrollBehavior;
}

interface ScrollToOptions extends ScrollOptions {
  readonly left?: number;
  readonly top?: number;
}

interface SecurityPolicyViolationEventInit extends EventInit {
  readonly blockedURI?: string;
  readonly columnNumber?: number;
  readonly disposition: SecurityPolicyViolationEventDisposition;
  readonly documentURI: string;
  readonly effectiveDirective: string;
  readonly lineNumber?: number;
  readonly originalPolicy: string;
  readonly referrer?: string;
  readonly sample?: string;
  readonly sourceFile?: string;
  readonly statusCode: number;
  readonly violatedDirective: string;
}

interface ShadowRootInit {
  readonly delegatesFocus?: boolean;
  readonly mode: ShadowRootMode;
  readonly slotAssignment?: SlotAssignmentMode;
}

interface ShareData {
  readonly files?: readonly File[];
  readonly text?: string;
  readonly title?: string;
  readonly url?: string;
}

interface SpeechSynthesisErrorEventInit extends SpeechSynthesisEventInit {
  readonly error: SpeechSynthesisErrorCode;
}

interface SpeechSynthesisEventInit extends EventInit {
  readonly charIndex?: number;
  readonly charLength?: number;
  readonly elapsedTime?: number;
  readonly name?: string;
  readonly utterance: SpeechSynthesisUtterance;
}

interface StaticRangeInit {
  readonly endContainer: Node;
  readonly endOffset: number;
  readonly startContainer: Node;
  readonly startOffset: number;
}

interface StereoPannerOptions extends AudioNodeOptions {
  readonly pan?: number;
}

interface StorageEstimate {
  readonly quota?: number;
  readonly usage?: number;
}

interface StorageEventInit extends EventInit {
  readonly key?: string | null;
  readonly newValue?: string | null;
  readonly oldValue?: string | null;
  readonly storageArea?: Storage | null;
  readonly url?: string;
}

interface StreamPipeOptions {
  readonly preventAbort?: boolean;
  readonly preventCancel?: boolean;
  /**
   * Pipes this readable stream to a given writable stream destination. The way in which the piping process behaves under various error conditions can be customized with a number of passed options. It returns a promise that fulfills when the piping process completes successfully, or rejects if any errors were encountered.
   *
   * Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader.
   *
   * Errors and closures of the source and destination streams propagate as follows:
   *
   * An error in this source readable stream will abort destination, unless preventAbort is truthy. The returned promise will be rejected with the source's error, or with any error that occurs during aborting the destination.
   *
   * An error in destination will cancel this source readable stream, unless preventCancel is truthy. The returned promise will be rejected with the destination's error, or with any error that occurs during canceling the source.
   *
   * When this source readable stream closes, destination will be closed, unless preventClose is truthy. The returned promise will be fulfilled once this process completes, unless an error is encountered while closing the destination, in which case it will be rejected with that error.
   *
   * If destination starts out closed or closing, this source readable stream will be canceled, unless preventCancel is true. The returned promise will be rejected with an error indicating piping to a closed stream failed, or with any error that occurs during canceling the source.
   *
   * The signal option can be set to an AbortSignal to allow aborting an ongoing pipe operation via the corresponding AbortController. In this case, this source readable stream will be canceled, and destination aborted, unless the respective options preventCancel or preventAbort are set.
   */
  readonly preventClose?: boolean;
  readonly signal?: AbortSignal;
}

interface StructuredSerializeOptions {
  readonly transfer?: readonly Transferable[];
}

interface SubmitEventInit extends EventInit {
  readonly submitter?: HTMLElement | null;
}

interface TextDecodeOptions {
  readonly stream?: boolean;
}

interface TextDecoderOptions {
  readonly fatal?: boolean;
  readonly ignoreBOM?: boolean;
}

interface TextEncoderEncodeIntoResult {
  readonly read?: number;
  readonly written?: number;
}

interface TouchEventInit extends EventModifierInit {
  readonly changedTouches?: readonly Touch[];
  readonly targetTouches?: readonly Touch[];
  readonly touches?: readonly Touch[];
}

interface TouchInit {
  readonly altitudeAngle?: number;
  readonly azimuthAngle?: number;
  readonly clientX?: number;
  readonly clientY?: number;
  readonly force?: number;
  readonly identifier: number;
  readonly pageX?: number;
  readonly pageY?: number;
  readonly radiusX?: number;
  readonly radiusY?: number;
  readonly rotationAngle?: number;
  readonly screenX?: number;
  readonly screenY?: number;
  readonly target: EventTarget;
  readonly touchType?: TouchType;
}

interface TrackEventInit extends EventInit {
  readonly track?: TextTrack | null;
}

interface Transformer<I = unknown, O = unknown> {
  readonly flush?: TransformerFlushCallback<O>;
  readonly readableType?: undefined;
  readonly start?: TransformerStartCallback<O>;
  readonly transform?: TransformerTransformCallback<I, O>;
  readonly writableType?: undefined;
}

interface TransitionEventInit extends EventInit {
  readonly elapsedTime?: number;
  readonly propertyName?: string;
  readonly pseudoElement?: string;
}

interface UIEventInit extends EventInit {
  readonly detail?: number;
  readonly view?: Window | null;
  /** @deprecated */
  readonly which?: number;
}

interface ULongRange {
  readonly max?: number;
  readonly min?: number;
}

interface UnderlyingSink<W = unknown> {
  readonly abort?: UnderlyingSinkAbortCallback;
  readonly close?: UnderlyingSinkCloseCallback;
  readonly start?: UnderlyingSinkStartCallback;
  readonly type?: undefined;
  readonly write?: UnderlyingSinkWriteCallback<W>;
}

interface UnderlyingSource<R = unknown> {
  readonly cancel?: UnderlyingSourceCancelCallback;
  readonly pull?: UnderlyingSourcePullCallback<R>;
  readonly start?: UnderlyingSourceStartCallback<R>;
  readonly type?: undefined;
}

interface VideoColorSpaceInit {
  readonly fullRange?: boolean;
  readonly matrix?: VideoMatrixCoefficients;
  readonly primaries?: VideoColorPrimaries;
  readonly transfer?: VideoTransferCharacteristics;
}

interface VideoConfiguration {
  readonly bitrate: number;
  readonly colorGamut?: ColorGamut;
  readonly contentType: string;
  readonly framerate: number;
  readonly hdrMetadataType?: HdrMetadataType;
  readonly height: number;
  readonly scalabilityMode?: string;
  readonly transferFunction?: TransferFunction;
  readonly width: number;
}

interface VideoFrameMetadata {
  readonly captureTime?: DOMHighResTimeStamp;
  readonly expectedDisplayTime: DOMHighResTimeStamp;
  readonly height: number;
  readonly mediaTime: number;
  readonly presentationTime: DOMHighResTimeStamp;
  readonly presentedFrames: number;
  readonly processingDuration?: number;
  readonly receiveTime?: DOMHighResTimeStamp;
  readonly rtpTimestamp?: number;
  readonly width: number;
}

interface WaveShaperOptions extends AudioNodeOptions {
  readonly curve?: readonly number[] | Float32Array;
  readonly oversample?: OverSampleType;
}

interface WebGLContextAttributes {
  readonly alpha?: boolean;
  readonly antialias?: boolean;
  readonly depth?: boolean;
  readonly desynchronized?: boolean;
  readonly failIfMajorPerformanceCaveat?: boolean;
  readonly powerPreference?: WebGLPowerPreference;
  readonly premultipliedAlpha?: boolean;
  readonly preserveDrawingBuffer?: boolean;
  readonly stencil?: boolean;
}

interface WebGLContextEventInit extends EventInit {
  readonly statusMessage?: string;
}

interface WheelEventInit extends MouseEventInit {
  readonly deltaMode?: number;
  readonly deltaX?: number;
  readonly deltaY?: number;
  readonly deltaZ?: number;
}

interface WindowPostMessageOptions extends StructuredSerializeOptions {
  readonly targetOrigin?: string;
}

interface WorkerOptions {
  readonly credentials?: RequestCredentials;
  readonly name?: string;
  readonly type?: WorkerType;
}

interface WorkletOptions {
  readonly credentials?: RequestCredentials;
}

type NodeFilter = ((node: Node) => number) | { acceptNode(node: Node): number };

declare const NodeFilter: {
  readonly FILTER_ACCEPT: number;
  readonly FILTER_REJECT: number;
  readonly FILTER_SKIP: number;
  readonly SHOW_ALL: number;
  readonly SHOW_ATTRIBUTE: number;
  readonly SHOW_CDATA_SECTION: number;
  readonly SHOW_COMMENT: number;
  readonly SHOW_DOCUMENT: number;
  readonly SHOW_DOCUMENT_FRAGMENT: number;
  readonly SHOW_DOCUMENT_TYPE: number;
  readonly SHOW_ELEMENT: number;
  readonly SHOW_ENTITY: number;
  readonly SHOW_ENTITY_REFERENCE: number;
  readonly SHOW_NOTATION: number;
  readonly SHOW_PROCESSING_INSTRUCTION: number;
  readonly SHOW_TEXT: number;
};

type XPathNSResolver =
  | ((prefix: string | null) => string | null)
  | { lookupNamespaceURI(prefix: string | null): string | null };

/** The ANGLE_instanced_arrays extension is part of the WebGL API and allows to draw the same object, or groups of similar objects multiple times, if they share the same vertex data, primitive count and type. */
interface ANGLE_instanced_arrays {
  drawArraysInstancedANGLE(
    mode: GLenum,
    first: GLint,
    count: GLsizei,
    primcount: GLsizei
  ): void;
  drawElementsInstancedANGLE(
    mode: GLenum,
    count: GLsizei,
    type: GLenum,
    offset: GLintptr,
    primcount: GLsizei
  ): void;
  vertexAttribDivisorANGLE(index: GLuint, divisor: GLuint): void;
  readonly VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: GLenum;
}

interface ARIAMixin {
  readonly ariaAtomic: string | null;
  readonly ariaAutoComplete: string | null;
  readonly ariaBusy: string | null;
  readonly ariaChecked: string | null;
  readonly ariaColCount: string | null;
  readonly ariaColIndex: string | null;
  readonly ariaColSpan: string | null;
  readonly ariaCurrent: string | null;
  readonly ariaDisabled: string | null;
  readonly ariaExpanded: string | null;
  readonly ariaHasPopup: string | null;
  readonly ariaHidden: string | null;
  readonly ariaKeyShortcuts: string | null;
  readonly ariaLabel: string | null;
  readonly ariaLevel: string | null;
  readonly ariaLive: string | null;
  readonly ariaModal: string | null;
  readonly ariaMultiLine: string | null;
  readonly ariaMultiSelectable: string | null;
  readonly ariaOrientation: string | null;
  readonly ariaPlaceholder: string | null;
  readonly ariaPosInSet: string | null;
  readonly ariaPressed: string | null;
  readonly ariaReadOnly: string | null;
  readonly ariaRequired: string | null;
  readonly ariaRoleDescription: string | null;
  readonly ariaRowCount: string | null;
  readonly ariaRowIndex: string | null;
  readonly ariaRowSpan: string | null;
  readonly ariaSelected: string | null;
  readonly ariaSetSize: string | null;
  readonly ariaSort: string | null;
  readonly ariaValueMax: string | null;
  readonly ariaValueMin: string | null;
  readonly ariaValueNow: string | null;
  readonly ariaValueText: string | null;
}

/** A controller object that allows you to abort one or more DOM requests as and when desired. */
interface AbortController {
  /** Returns the AbortSignal object associated with this object. */
  readonly signal: AbortSignal;
  /** Invoking this method will set this object's AbortSignal's aborted flag and signal to any observers that the associated activity is to be aborted. */
  abort(reason?: unknown): void;
}

declare const AbortController: {
  readonly prototype: AbortController;
  new (): AbortController;
};

interface AbortSignalEventMap {
  readonly abort: Event;
}

/** A signal object that allows you to communicate with a DOM request (such as a Fetch) and abort it if required via an AbortController object. */
interface AbortSignal extends EventTarget {
  /** Returns true if this AbortSignal's AbortController has signaled to abort, and false otherwise. */
  readonly aborted: boolean;
  readonly onabort: ((this: AbortSignal, ev: Event) => unknown) | null;
  readonly reason: unknown;
  throwIfAborted(): void;
  addEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const AbortSignal: {
  readonly prototype: AbortSignal;
  new (): AbortSignal;
  // abort(): AbortSignal; - To be re-added in the future
};

interface AbstractRange {
  /** Returns true if range is collapsed, and false otherwise. */
  readonly collapsed: boolean;
  /** Returns range's end node. */
  readonly endContainer: Node;
  /** Returns range's end offset. */
  readonly endOffset: number;
  /** Returns range's start node. */
  readonly startContainer: Node;
  /** Returns range's start offset. */
  readonly startOffset: number;
}

declare const AbstractRange: {
  readonly prototype: AbstractRange;
  new (): AbstractRange;
};

interface AbstractWorkerEventMap {
  readonly error: ErrorEvent;
}

interface AbstractWorker {
  readonly onerror: ((this: AbstractWorker, ev: ErrorEvent) => unknown) | null;
  addEventListener<K extends keyof AbstractWorkerEventMap>(
    type: K,
    listener: (this: AbstractWorker, ev: AbstractWorkerEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AbstractWorkerEventMap>(
    type: K,
    listener: (this: AbstractWorker, ev: AbstractWorkerEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** A node able to provide real-time frequency and time-domain analysis information. It is an AudioNode that passes the audio stream unchanged from the input to the output, but allows you to take the generated data, process it, and create audio visualizations. */
interface AnalyserNode extends AudioNode {
  readonly fftSize: number;
  readonly frequencyBinCount: number;
  readonly maxDecibels: number;
  readonly minDecibels: number;
  readonly smoothingTimeConstant: number;
  getByteFrequencyData(array: Uint8Array): void;
  getByteTimeDomainData(array: Uint8Array): void;
  getFloatFrequencyData(array: Float32Array): void;
  getFloatTimeDomainData(array: Float32Array): void;
}

declare const AnalyserNode: {
  readonly prototype: AnalyserNode;
  new (context: BaseAudioContext, options?: AnalyserOptions): AnalyserNode;
};

interface Animatable {
  animate(
    keyframes: readonly Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions
  ): Animation;
  getAnimations(options?: GetAnimationsOptions): readonly Animation[];
}

interface AnimationEventMap {
  readonly cancel: AnimationPlaybackEvent;
  readonly finish: AnimationPlaybackEvent;
  readonly remove: Event;
}

interface Animation extends EventTarget {
  readonly currentTime: CSSNumberish | null;
  readonly effect: AnimationEffect | null;
  readonly finished: Promise<Animation>;
  readonly id: string;
  readonly oncancel:
    | ((this: Animation, ev: AnimationPlaybackEvent) => unknown)
    | null;
  readonly onfinish:
    | ((this: Animation, ev: AnimationPlaybackEvent) => unknown)
    | null;
  readonly onremove: ((this: Animation, ev: Event) => unknown) | null;
  readonly pending: boolean;
  readonly playState: AnimationPlayState;
  readonly playbackRate: number;
  readonly ready: Promise<Animation>;
  readonly replaceState: AnimationReplaceState;
  readonly startTime: CSSNumberish | null;
  readonly timeline: AnimationTimeline | null;
  cancel(): void;
  commitStyles(): void;
  finish(): void;
  pause(): void;
  persist(): void;
  play(): void;
  reverse(): void;
  updatePlaybackRate(playbackRate: number): void;
  addEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: Animation, ev: AnimationEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: Animation, ev: AnimationEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const Animation: {
  readonly prototype: Animation;
  new (
    effect?: AnimationEffect | null,
    timeline?: AnimationTimeline | null
  ): Animation;
};

interface AnimationEffect {
  getComputedTiming(): ComputedEffectTiming;
  getTiming(): EffectTiming;
  updateTiming(timing?: OptionalEffectTiming): void;
}

declare const AnimationEffect: {
  readonly prototype: AnimationEffect;
  new (): AnimationEffect;
};

/** Events providing information related to animations. */
interface AnimationEvent extends Event {
  readonly animationName: string;
  readonly elapsedTime: number;
  readonly pseudoElement: string;
}

declare const AnimationEvent: {
  readonly prototype: AnimationEvent;
  new (
    type: string,
    animationEventInitDict?: AnimationEventInit
  ): AnimationEvent;
};

interface AnimationFrameProvider {
  cancelAnimationFrame(handle: number): void;
  requestAnimationFrame(callback: FrameRequestCallback): number;
}

interface AnimationPlaybackEvent extends Event {
  readonly currentTime: CSSNumberish | null;
  readonly timelineTime: CSSNumberish | null;
}

declare const AnimationPlaybackEvent: {
  readonly prototype: AnimationPlaybackEvent;
  new (
    type: string,
    eventInitDict?: AnimationPlaybackEventInit
  ): AnimationPlaybackEvent;
};

interface AnimationTimeline {
  readonly currentTime: number | null;
}

declare const AnimationTimeline: {
  readonly prototype: AnimationTimeline;
  new (): AnimationTimeline;
};

/** A DOM element's attribute as an object. In most DOM methods, you will probably directly retrieve the attribute as a string (e.g., Element.getAttribute(), but certain functions (e.g., Element.getAttributeNode()) or means of iterating give Attr types. */
interface Attr extends Node {
  readonly localName: string;
  readonly name: string;
  readonly namespaceURI: string | null;
  readonly ownerDocument: Document;
  readonly ownerElement: Element | null;
  readonly prefix: string | null;
  readonly specified: boolean;
  readonly value: string;
}

declare const Attr: {
  readonly prototype: Attr;
  new (): Attr;
};

/** A short audio asset residing in memory, created from an audio file using the AudioContext.decodeAudioData() method, or from raw data using AudioContext.createBuffer(). Once put into an AudioBuffer, the audio can then be played by being passed into an AudioBufferSourceNode. */
interface AudioBuffer {
  readonly duration: number;
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  copyFromChannel(
    destination: Float32Array,
    channelNumber: number,
    bufferOffset?: number
  ): void;
  copyToChannel(
    source: Float32Array,
    channelNumber: number,
    bufferOffset?: number
  ): void;
  getChannelData(channel: number): Float32Array;
}

declare const AudioBuffer: {
  readonly prototype: AudioBuffer;
  new (options: AudioBufferOptions): AudioBuffer;
};

/** An AudioScheduledSourceNode which represents an audio source consisting of in-memory audio data, stored in an AudioBuffer. It's especially useful for playing back audio which has particularly stringent timing accuracy requirements, such as for sounds that must match a specific rhythm and can be kept in memory rather than being played from disk or the network. */
interface AudioBufferSourceNode extends AudioScheduledSourceNode {
  readonly buffer: AudioBuffer | null;
  readonly detune: AudioParam;
  readonly loop: boolean;
  readonly loopEnd: number;
  readonly loopStart: number;
  readonly playbackRate: AudioParam;
  start(when?: number, offset?: number, duration?: number): void;
  addEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(
    type: K,
    listener: (
      this: AudioBufferSourceNode,
      ev: AudioScheduledSourceNodeEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(
    type: K,
    listener: (
      this: AudioBufferSourceNode,
      ev: AudioScheduledSourceNodeEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const AudioBufferSourceNode: {
  readonly prototype: AudioBufferSourceNode;
  new (
    context: BaseAudioContext,
    options?: AudioBufferSourceOptions
  ): AudioBufferSourceNode;
};

/** An audio-processing graph built from audio modules linked together, each represented by an AudioNode. */
interface AudioContext extends BaseAudioContext {
  readonly baseLatency: number;
  close(): Promise<void>;
  createMediaElementSource(
    mediaElement: HTMLMediaElement
  ): MediaElementAudioSourceNode;
  createMediaStreamDestination(): MediaStreamAudioDestinationNode;
  createMediaStreamSource(mediaStream: MediaStream): MediaStreamAudioSourceNode;
  getOutputTimestamp(): AudioTimestamp;
  resume(): Promise<void>;
  suspend(): Promise<void>;
  addEventListener<K extends keyof BaseAudioContextEventMap>(
    type: K,
    listener: (this: AudioContext, ev: BaseAudioContextEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof BaseAudioContextEventMap>(
    type: K,
    listener: (this: AudioContext, ev: BaseAudioContextEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const AudioContext: {
  readonly prototype: AudioContext;
  new (contextOptions?: AudioContextOptions): AudioContext;
};

/** AudioDestinationNode has no output (as it is the output, no more AudioNode can be linked after it in the audio graph) and one input. The number of channels in the input must be between 0 and the maxChannelCount value or an exception is raised. */
interface AudioDestinationNode extends AudioNode {
  readonly maxChannelCount: number;
}

declare const AudioDestinationNode: {
  readonly prototype: AudioDestinationNode;
  new (): AudioDestinationNode;
};

/** The position and orientation of the unique person listening to the audio scene, and is used in audio spatialization. All PannerNodes spatialize in relation to the AudioListener stored in the BaseAudioContext.listener attribute. */
interface AudioListener {
  readonly forwardX: AudioParam;
  readonly forwardY: AudioParam;
  readonly forwardZ: AudioParam;
  readonly positionX: AudioParam;
  readonly positionY: AudioParam;
  readonly positionZ: AudioParam;
  readonly upX: AudioParam;
  readonly upY: AudioParam;
  readonly upZ: AudioParam;
  /** @deprecated */
  setOrientation(
    x: number,
    y: number,
    z: number,
    xUp: number,
    yUp: number,
    zUp: number
  ): void;
  /** @deprecated */
  setPosition(x: number, y: number, z: number): void;
}

declare const AudioListener: {
  readonly prototype: AudioListener;
  new (): AudioListener;
};

/** A generic interface for representing an audio processing module. Examples include: */
interface AudioNode extends EventTarget {
  readonly channelCount: number;
  readonly channelCountMode: ChannelCountMode;
  readonly channelInterpretation: ChannelInterpretation;
  readonly context: BaseAudioContext;
  readonly numberOfInputs: number;
  readonly numberOfOutputs: number;
  connect(
    destinationNode: AudioNode,
    output?: number,
    input?: number
  ): AudioNode;
  connect(destinationParam: AudioParam, output?: number): void;
  disconnect(): void;
  disconnect(output: number): void;
  disconnect(destinationNode: AudioNode): void;
  disconnect(destinationNode: AudioNode, output: number): void;
  disconnect(destinationNode: AudioNode, output: number, input: number): void;
  disconnect(destinationParam: AudioParam): void;
  disconnect(destinationParam: AudioParam, output: number): void;
}

declare const AudioNode: {
  readonly prototype: AudioNode;
  new (): AudioNode;
};

/** The Web Audio API's AudioParam interface represents an audio-related parameter, usually a parameter of an AudioNode (such as GainNode.gain). */
interface AudioParam {
  readonly automationRate: AutomationRate;
  readonly defaultValue: number;
  readonly maxValue: number;
  readonly minValue: number;
  readonly value: number;
  cancelAndHoldAtTime(cancelTime: number): AudioParam;
  cancelScheduledValues(cancelTime: number): AudioParam;
  exponentialRampToValueAtTime(value: number, endTime: number): AudioParam;
  linearRampToValueAtTime(value: number, endTime: number): AudioParam;
  setTargetAtTime(
    target: number,
    startTime: number,
    timeConstant: number
  ): AudioParam;
  setValueAtTime(value: number, startTime: number): AudioParam;
  setValueCurveAtTime(
    values: readonly number[] | Float32Array,
    startTime: number,
    duration: number
  ): AudioParam;
}

declare const AudioParam: {
  readonly prototype: AudioParam;
  new (): AudioParam;
};

interface AudioParamMap {
  forEach(
    callbackfn: (value: AudioParam, key: string, parent: AudioParamMap) => void,
    thisArg?: unknown
  ): void;
}

declare const AudioParamMap: {
  readonly prototype: AudioParamMap;
  new (): AudioParamMap;
};

/**
 * The Web Audio API events that occur when a ScriptProcessorNode input buffer is ready to be processed.
 * @deprecated As of the August 29 2014 Web Audio API spec publication, this feature has been marked as deprecated, and is soon to be replaced by AudioWorklet.
 */
interface AudioProcessingEvent extends Event {
  /** @deprecated */
  readonly inputBuffer: AudioBuffer;
  /** @deprecated */
  readonly outputBuffer: AudioBuffer;
  /** @deprecated */
  readonly playbackTime: number;
}

/** @deprecated */
declare const AudioProcessingEvent: {
  readonly prototype: AudioProcessingEvent;
  new (
    type: string,
    eventInitDict: AudioProcessingEventInit
  ): AudioProcessingEvent;
};

interface AudioScheduledSourceNodeEventMap {
  readonly ended: Event;
}

interface AudioScheduledSourceNode extends AudioNode {
  readonly onended:
    | ((this: AudioScheduledSourceNode, ev: Event) => unknown)
    | null;
  start(when?: number): void;
  stop(when?: number): void;
  addEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(
    type: K,
    listener: (
      this: AudioScheduledSourceNode,
      ev: AudioScheduledSourceNodeEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(
    type: K,
    listener: (
      this: AudioScheduledSourceNode,
      ev: AudioScheduledSourceNodeEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const AudioScheduledSourceNode: {
  readonly prototype: AudioScheduledSourceNode;
  new (): AudioScheduledSourceNode;
};

/** Available only in secure contexts. */
interface AudioWorklet extends Worklet {}

declare const AudioWorklet: {
  readonly prototype: AudioWorklet;
  new (): AudioWorklet;
};

interface AudioWorkletNodeEventMap {
  readonly processorerror: Event;
}

/** Available only in secure contexts. */
interface AudioWorkletNode extends AudioNode {
  readonly onprocessorerror:
    | ((this: AudioWorkletNode, ev: Event) => unknown)
    | null;
  readonly parameters: AudioParamMap;
  readonly port: MessagePort;
  addEventListener<K extends keyof AudioWorkletNodeEventMap>(
    type: K,
    listener: (
      this: AudioWorkletNode,
      ev: AudioWorkletNodeEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AudioWorkletNodeEventMap>(
    type: K,
    listener: (
      this: AudioWorkletNode,
      ev: AudioWorkletNodeEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const AudioWorkletNode: {
  readonly prototype: AudioWorkletNode;
  new (
    context: BaseAudioContext,
    name: string,
    options?: AudioWorkletNodeOptions
  ): AudioWorkletNode;
};

/** Available only in secure contexts. */
interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
  readonly authenticatorData: ArrayBuffer;
  readonly signature: ArrayBuffer;
  readonly userHandle: ArrayBuffer | null;
}

declare const AuthenticatorAssertionResponse: {
  readonly prototype: AuthenticatorAssertionResponse;
  new (): AuthenticatorAssertionResponse;
};

/** Available only in secure contexts. */
interface AuthenticatorAttestationResponse extends AuthenticatorResponse {
  readonly attestationObject: ArrayBuffer;
}

declare const AuthenticatorAttestationResponse: {
  readonly prototype: AuthenticatorAttestationResponse;
  new (): AuthenticatorAttestationResponse;
};

/** Available only in secure contexts. */
interface AuthenticatorResponse {
  readonly clientDataJSON: ArrayBuffer;
}

declare const AuthenticatorResponse: {
  readonly prototype: AuthenticatorResponse;
  new (): AuthenticatorResponse;
};

interface BarProp {
  readonly visible: boolean;
}

declare const BarProp: {
  readonly prototype: BarProp;
  new (): BarProp;
};

interface BaseAudioContextEventMap {
  readonly statechange: Event;
}

interface BaseAudioContext extends EventTarget {
  /** Available only in secure contexts. */
  readonly audioWorklet: AudioWorklet;
  readonly currentTime: number;
  readonly destination: AudioDestinationNode;
  readonly listener: AudioListener;
  readonly onstatechange:
    | ((this: BaseAudioContext, ev: Event) => unknown)
    | null;
  readonly sampleRate: number;
  readonly state: AudioContextState;
  createAnalyser(): AnalyserNode;
  createBiquadFilter(): BiquadFilterNode;
  createBuffer(
    numberOfChannels: number,
    length: number,
    sampleRate: number
  ): AudioBuffer;
  createBufferSource(): AudioBufferSourceNode;
  createChannelMerger(numberOfInputs?: number): ChannelMergerNode;
  createChannelSplitter(numberOfOutputs?: number): ChannelSplitterNode;
  createConstantSource(): ConstantSourceNode;
  createConvolver(): ConvolverNode;
  createDelay(maxDelayTime?: number): DelayNode;
  createDynamicsCompressor(): DynamicsCompressorNode;
  createGain(): GainNode;
  createIIRFilter(
    feedforward: readonly number[],
    feedback: readonly number[]
  ): IIRFilterNode;
  createOscillator(): OscillatorNode;
  createPanner(): PannerNode;
  createPeriodicWave(
    real: readonly number[] | Float32Array,
    imag: readonly number[] | Float32Array,
    constraints?: PeriodicWaveConstraints
  ): PeriodicWave;
  /** @deprecated */
  createScriptProcessor(
    bufferSize?: number,
    numberOfInputChannels?: number,
    numberOfOutputChannels?: number
  ): ScriptProcessorNode;
  createStereoPanner(): StereoPannerNode;
  createWaveShaper(): WaveShaperNode;
  decodeAudioData(
    audioData: ArrayBuffer,
    successCallback?: DecodeSuccessCallback | null,
    errorCallback?: DecodeErrorCallback | null
  ): Promise<AudioBuffer>;
  addEventListener<K extends keyof BaseAudioContextEventMap>(
    type: K,
    listener: (
      this: BaseAudioContext,
      ev: BaseAudioContextEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof BaseAudioContextEventMap>(
    type: K,
    listener: (
      this: BaseAudioContext,
      ev: BaseAudioContextEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const BaseAudioContext: {
  readonly prototype: BaseAudioContext;
  new (): BaseAudioContext;
};

/** The beforeunload event is fired when the window, the document and its resources are about to be unloaded. */
interface BeforeUnloadEvent extends Event {
  readonly returnValue: unknown;
}

declare const BeforeUnloadEvent: {
  readonly prototype: BeforeUnloadEvent;
  new (): BeforeUnloadEvent;
};

/** A simple low-order filter, and is created using the AudioContext.createBiquadFilter() method. It is an AudioNode that can represent different kinds of filters, tone control devices, and graphic equalizers. */
interface BiquadFilterNode extends AudioNode {
  readonly Q: AudioParam;
  readonly detune: AudioParam;
  readonly frequency: AudioParam;
  readonly gain: AudioParam;
  readonly type: BiquadFilterType;
  getFrequencyResponse(
    frequencyHz: Float32Array,
    magResponse: Float32Array,
    phaseResponse: Float32Array
  ): void;
}

declare const BiquadFilterNode: {
  readonly prototype: BiquadFilterNode;
  new (
    context: BaseAudioContext,
    options?: BiquadFilterOptions
  ): BiquadFilterNode;
};

/** A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system. */
interface Blob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream<Uint8Array>;
  text(): Promise<string>;
}

declare const Blob: {
  readonly prototype: Blob;
  new (blobParts?: readonly BlobPart[], options?: BlobPropertyBag): Blob;
};

interface BlobEvent extends Event {
  readonly data: Blob;
  readonly timecode: DOMHighResTimeStamp;
}

declare const BlobEvent: {
  readonly prototype: BlobEvent;
  new (type: string, eventInitDict: BlobEventInit): BlobEvent;
};

interface Body {
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

interface BroadcastChannelEventMap {
  readonly message: MessageEvent;
  readonly messageerror: MessageEvent;
}

interface BroadcastChannel extends EventTarget {
  /** Returns the channel name (as passed to the constructor). */
  readonly name: string;
  readonly onmessage:
    | ((this: BroadcastChannel, ev: MessageEvent) => unknown)
    | null;
  readonly onmessageerror:
    | ((this: BroadcastChannel, ev: MessageEvent) => unknown)
    | null;
  /** Closes the BroadcastChannel object, opening it up to garbage collection. */
  close(): void;
  /** Sends the given message to other BroadcastChannel objects set up for this channel. Messages can be structured objects, e.g. nested objects and arrays. */
  postMessage(message: unknown): void;
  addEventListener<K extends keyof BroadcastChannelEventMap>(
    type: K,
    listener: (
      this: BroadcastChannel,
      ev: BroadcastChannelEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof BroadcastChannelEventMap>(
    type: K,
    listener: (
      this: BroadcastChannel,
      ev: BroadcastChannelEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const BroadcastChannel: {
  readonly prototype: BroadcastChannel;
  new (name: string): BroadcastChannel;
};

/** This Streams API interface provides a built-in byte length queuing strategy that can be used when constructing streams. */
interface ByteLengthQueuingStrategy extends QueuingStrategy<ArrayBufferView> {
  readonly highWaterMark: number;
  readonly size: QueuingStrategySize<ArrayBufferView>;
}

declare const ByteLengthQueuingStrategy: {
  readonly prototype: ByteLengthQueuingStrategy;
  new (init: QueuingStrategyInit): ByteLengthQueuingStrategy;
};

/** A CDATA section that can be used within XML to include extended portions of unescaped text. The symbols < and & don’t need escaping as they normally do when inside a CDATA section. */
interface CDATASection extends Text {}

declare const CDATASection: {
  readonly prototype: CDATASection;
  new (): CDATASection;
};

interface CSSAnimation extends Animation {
  readonly animationName: string;
  addEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: CSSAnimation, ev: AnimationEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const CSSAnimation: {
  readonly prototype: CSSAnimation;
  new (): CSSAnimation;
};

/** A single condition CSS at-rule, which consists of a condition and a statement block. It is a child of CSSGroupingRule. */
interface CSSConditionRule extends CSSGroupingRule {
  readonly conditionText: string;
}

declare const CSSConditionRule: {
  readonly prototype: CSSConditionRule;
  new (): CSSConditionRule;
};

interface CSSCounterStyleRule extends CSSRule {
  readonly additiveSymbols: string;
  readonly fallback: string;
  readonly name: string;
  readonly negative: string;
  readonly pad: string;
  readonly prefix: string;
  readonly range: string;
  readonly speakAs: string;
  readonly suffix: string;
  readonly symbols: string;
  readonly system: string;
}

declare const CSSCounterStyleRule: {
  readonly prototype: CSSCounterStyleRule;
  new (): CSSCounterStyleRule;
};

interface CSSFontFaceRule extends CSSRule {
  readonly style: CSSStyleDeclaration;
}

declare const CSSFontFaceRule: {
  readonly prototype: CSSFontFaceRule;
  new (): CSSFontFaceRule;
};

/** Any CSS at-rule that contains other rules nested within it. */
interface CSSGroupingRule extends CSSRule {
  readonly cssRules: CSSRuleList;
  deleteRule(index: number): void;
  insertRule(rule: string, index?: number): number;
}

declare const CSSGroupingRule: {
  readonly prototype: CSSGroupingRule;
  new (): CSSGroupingRule;
};

interface CSSImportRule extends CSSRule {
  readonly href: string;
  readonly media: MediaList;
  readonly styleSheet: CSSStyleSheet;
}

declare const CSSImportRule: {
  readonly prototype: CSSImportRule;
  new (): CSSImportRule;
};

/** An object representing a set of style for a given keyframe. It corresponds to the contains of a single keyframe of a @keyframes at-rule. It implements the CSSRule interface with a type value of 8 (CSSRule.KEYFRAME_RULE). */
interface CSSKeyframeRule extends CSSRule {
  readonly keyText: string;
  readonly style: CSSStyleDeclaration;
}

declare const CSSKeyframeRule: {
  readonly prototype: CSSKeyframeRule;
  new (): CSSKeyframeRule;
};

/** An object representing a complete set of keyframes for a CSS animation. It corresponds to the contains of a whole @keyframes at-rule. It implements the CSSRule interface with a type value of 7 (CSSRule.KEYFRAMES_RULE). */
interface CSSKeyframesRule extends CSSRule {
  readonly cssRules: CSSRuleList;
  readonly name: string;
  appendRule(rule: string): void;
  deleteRule(select: string): void;
  findRule(select: string): CSSKeyframeRule | null;
}

declare const CSSKeyframesRule: {
  readonly prototype: CSSKeyframesRule;
  new (): CSSKeyframesRule;
};

/** A single CSS @media rule. It implements the CSSConditionRule interface, and therefore the CSSGroupingRule and the CSSRule interface with a type value of 4 (CSSRule.MEDIA_RULE). */
interface CSSMediaRule extends CSSConditionRule {
  readonly media: MediaList;
}

declare const CSSMediaRule: {
  readonly prototype: CSSMediaRule;
  new (): CSSMediaRule;
};

/** An object representing a single CSS @namespace at-rule. It implements the CSSRule interface, with a type value of 10 (CSSRule.NAMESPACE_RULE). */
interface CSSNamespaceRule extends CSSRule {
  readonly namespaceURI: string;
  readonly prefix: string;
}

declare const CSSNamespaceRule: {
  readonly prototype: CSSNamespaceRule;
  new (): CSSNamespaceRule;
};

/** CSSPageRule is an interface representing a single CSS @page rule. It implements the CSSRule interface with a type value of 6 (CSSRule.PAGE_RULE). */
interface CSSPageRule extends CSSGroupingRule {
  readonly selectorText: string;
  readonly style: CSSStyleDeclaration;
}

declare const CSSPageRule: {
  readonly prototype: CSSPageRule;
  new (): CSSPageRule;
};

/** A single CSS rule. There are several types of rules, listed in the Type constants section below. */
interface CSSRule {
  readonly cssText: string;
  readonly parentRule: CSSRule | null;
  readonly parentStyleSheet: CSSStyleSheet | null;
  /** @deprecated */
  readonly type: number;
  readonly CHARSET_RULE: number;
  readonly FONT_FACE_RULE: number;
  readonly IMPORT_RULE: number;
  readonly KEYFRAMES_RULE: number;
  readonly KEYFRAME_RULE: number;
  readonly MEDIA_RULE: number;
  readonly NAMESPACE_RULE: number;
  readonly PAGE_RULE: number;
  readonly STYLE_RULE: number;
  readonly SUPPORTS_RULE: number;
}

declare const CSSRule: {
  readonly prototype: CSSRule;
  new (): CSSRule;
  readonly CHARSET_RULE: number;
  readonly FONT_FACE_RULE: number;
  readonly IMPORT_RULE: number;
  readonly KEYFRAMES_RULE: number;
  readonly KEYFRAME_RULE: number;
  readonly MEDIA_RULE: number;
  readonly NAMESPACE_RULE: number;
  readonly PAGE_RULE: number;
  readonly STYLE_RULE: number;
  readonly SUPPORTS_RULE: number;
};

/** A CSSRuleList is an (indirect-modify only) array-like object containing an ordered collection of CSSRule objects. */
interface CSSRuleList {
  readonly length: number;
  item(index: number): CSSRule | null;
  readonly [index: number]: CSSRule;
}

declare const CSSRuleList: {
  readonly prototype: CSSRuleList;
  new (): CSSRuleList;
};

/** An object that is a CSS declaration block, and exposes style information and various style-related methods and properties. */
interface CSSStyleDeclaration {
  readonly accentColor: string;
  readonly alignContent: string;
  readonly alignItems: string;
  readonly alignSelf: string;
  readonly alignmentBaseline: string;
  readonly all: string;
  readonly animation: string;
  readonly animationDelay: string;
  readonly animationDirection: string;
  readonly animationDuration: string;
  readonly animationFillMode: string;
  readonly animationIterationCount: string;
  readonly animationName: string;
  readonly animationPlayState: string;
  readonly animationTimingFunction: string;
  readonly appearance: string;
  readonly aspectRatio: string;
  readonly backfaceVisibility: string;
  readonly background: string;
  readonly backgroundAttachment: string;
  readonly backgroundBlendMode: string;
  readonly backgroundClip: string;
  readonly backgroundColor: string;
  readonly backgroundImage: string;
  readonly backgroundOrigin: string;
  readonly backgroundPosition: string;
  readonly backgroundPositionX: string;
  readonly backgroundPositionY: string;
  readonly backgroundRepeat: string;
  readonly backgroundSize: string;
  readonly baselineShift: string;
  readonly blockSize: string;
  readonly border: string;
  readonly borderBlock: string;
  readonly borderBlockColor: string;
  readonly borderBlockEnd: string;
  readonly borderBlockEndColor: string;
  readonly borderBlockEndStyle: string;
  readonly borderBlockEndWidth: string;
  readonly borderBlockStart: string;
  readonly borderBlockStartColor: string;
  readonly borderBlockStartStyle: string;
  readonly borderBlockStartWidth: string;
  readonly borderBlockStyle: string;
  readonly borderBlockWidth: string;
  readonly borderBottom: string;
  readonly borderBottomColor: string;
  readonly borderBottomLeftRadius: string;
  readonly borderBottomRightRadius: string;
  readonly borderBottomStyle: string;
  readonly borderBottomWidth: string;
  readonly borderCollapse: string;
  readonly borderColor: string;
  readonly borderEndEndRadius: string;
  readonly borderEndStartRadius: string;
  readonly borderImage: string;
  readonly borderImageOutset: string;
  readonly borderImageRepeat: string;
  readonly borderImageSlice: string;
  readonly borderImageSource: string;
  readonly borderImageWidth: string;
  readonly borderInline: string;
  readonly borderInlineColor: string;
  readonly borderInlineEnd: string;
  readonly borderInlineEndColor: string;
  readonly borderInlineEndStyle: string;
  readonly borderInlineEndWidth: string;
  readonly borderInlineStart: string;
  readonly borderInlineStartColor: string;
  readonly borderInlineStartStyle: string;
  readonly borderInlineStartWidth: string;
  readonly borderInlineStyle: string;
  readonly borderInlineWidth: string;
  readonly borderLeft: string;
  readonly borderLeftColor: string;
  readonly borderLeftStyle: string;
  readonly borderLeftWidth: string;
  readonly borderRadius: string;
  readonly borderRight: string;
  readonly borderRightColor: string;
  readonly borderRightStyle: string;
  readonly borderRightWidth: string;
  readonly borderSpacing: string;
  readonly borderStartEndRadius: string;
  readonly borderStartStartRadius: string;
  readonly borderStyle: string;
  readonly borderTop: string;
  readonly borderTopColor: string;
  readonly borderTopLeftRadius: string;
  readonly borderTopRightRadius: string;
  readonly borderTopStyle: string;
  readonly borderTopWidth: string;
  readonly borderWidth: string;
  readonly bottom: string;
  readonly boxShadow: string;
  readonly boxSizing: string;
  readonly breakAfter: string;
  readonly breakBefore: string;
  readonly breakInside: string;
  readonly captionSide: string;
  readonly caretColor: string;
  readonly clear: string;
  /** @deprecated */
  readonly clip: string;
  readonly clipPath: string;
  readonly clipRule: string;
  readonly color: string;
  readonly colorInterpolation: string;
  readonly colorInterpolationFilters: string;
  readonly colorScheme: string;
  readonly columnCount: string;
  readonly columnFill: string;
  readonly columnGap: string;
  readonly columnRule: string;
  readonly columnRuleColor: string;
  readonly columnRuleStyle: string;
  readonly columnRuleWidth: string;
  readonly columnSpan: string;
  readonly columnWidth: string;
  readonly columns: string;
  readonly contain: string;
  readonly content: string;
  readonly contentVisibility: string;
  readonly counterIncrement: string;
  readonly counterReset: string;
  readonly counterSet: string;
  readonly cssFloat: string;
  readonly cssText: string;
  readonly cursor: string;
  readonly direction: string;
  readonly display: string;
  readonly dominantBaseline: string;
  readonly emptyCells: string;
  readonly fill: string;
  readonly fillOpacity: string;
  readonly fillRule: string;
  readonly filter: string;
  readonly flex: string;
  readonly flexBasis: string;
  readonly flexDirection: string;
  readonly flexFlow: string;
  readonly flexGrow: string;
  readonly flexShrink: string;
  readonly flexWrap: string;
  readonly float: string;
  readonly floodColor: string;
  readonly floodOpacity: string;
  readonly font: string;
  readonly fontFamily: string;
  readonly fontFeatureSettings: string;
  readonly fontKerning: string;
  readonly fontOpticalSizing: string;
  readonly fontSize: string;
  readonly fontSizeAdjust: string;
  readonly fontStretch: string;
  readonly fontStyle: string;
  readonly fontSynthesis: string;
  readonly fontVariant: string;
  readonly fontVariantAlternates: string;
  readonly fontVariantCaps: string;
  readonly fontVariantEastAsian: string;
  readonly fontVariantLigatures: string;
  readonly fontVariantNumeric: string;
  readonly fontVariantPosition: string;
  readonly fontVariationSettings: string;
  readonly fontWeight: string;
  readonly gap: string;
  readonly grid: string;
  readonly gridArea: string;
  readonly gridAutoColumns: string;
  readonly gridAutoFlow: string;
  readonly gridAutoRows: string;
  readonly gridColumn: string;
  readonly gridColumnEnd: string;
  /** @deprecated This is a legacy alias of `columnGap`. */
  readonly gridColumnGap: string;
  readonly gridColumnStart: string;
  /** @deprecated This is a legacy alias of `gap`. */
  readonly gridGap: string;
  readonly gridRow: string;
  readonly gridRowEnd: string;
  /** @deprecated This is a legacy alias of `rowGap`. */
  readonly gridRowGap: string;
  readonly gridRowStart: string;
  readonly gridTemplate: string;
  readonly gridTemplateAreas: string;
  readonly gridTemplateColumns: string;
  readonly gridTemplateRows: string;
  readonly height: string;
  readonly hyphens: string;
  /** @deprecated */
  readonly imageOrientation: string;
  readonly imageRendering: string;
  readonly inlineSize: string;
  readonly inset: string;
  readonly insetBlock: string;
  readonly insetBlockEnd: string;
  readonly insetBlockStart: string;
  readonly insetInline: string;
  readonly insetInlineEnd: string;
  readonly insetInlineStart: string;
  readonly isolation: string;
  readonly justifyContent: string;
  readonly justifyItems: string;
  readonly justifySelf: string;
  readonly left: string;
  readonly length: number;
  readonly letterSpacing: string;
  readonly lightingColor: string;
  readonly lineBreak: string;
  readonly lineHeight: string;
  readonly listStyle: string;
  readonly listStyleImage: string;
  readonly listStylePosition: string;
  readonly listStyleType: string;
  readonly margin: string;
  readonly marginBlock: string;
  readonly marginBlockEnd: string;
  readonly marginBlockStart: string;
  readonly marginBottom: string;
  readonly marginInline: string;
  readonly marginInlineEnd: string;
  readonly marginInlineStart: string;
  readonly marginLeft: string;
  readonly marginRight: string;
  readonly marginTop: string;
  readonly marker: string;
  readonly markerEnd: string;
  readonly markerMid: string;
  readonly markerStart: string;
  readonly mask: string;
  readonly maskClip: string;
  readonly maskComposite: string;
  readonly maskImage: string;
  readonly maskMode: string;
  readonly maskOrigin: string;
  readonly maskPosition: string;
  readonly maskRepeat: string;
  readonly maskSize: string;
  readonly maskType: string;
  readonly maxBlockSize: string;
  readonly maxHeight: string;
  readonly maxInlineSize: string;
  readonly maxWidth: string;
  readonly minBlockSize: string;
  readonly minHeight: string;
  readonly minInlineSize: string;
  readonly minWidth: string;
  readonly mixBlendMode: string;
  readonly objectFit: string;
  readonly objectPosition: string;
  readonly offset: string;
  readonly offsetDistance: string;
  readonly offsetPath: string;
  readonly offsetRotate: string;
  readonly opacity: string;
  readonly order: string;
  readonly orphans: string;
  readonly outline: string;
  readonly outlineColor: string;
  readonly outlineOffset: string;
  readonly outlineStyle: string;
  readonly outlineWidth: string;
  readonly overflow: string;
  readonly overflowAnchor: string;
  readonly overflowWrap: string;
  readonly overflowX: string;
  readonly overflowY: string;
  readonly overscrollBehavior: string;
  readonly overscrollBehaviorBlock: string;
  readonly overscrollBehaviorInline: string;
  readonly overscrollBehaviorX: string;
  readonly overscrollBehaviorY: string;
  readonly padding: string;
  readonly paddingBlock: string;
  readonly paddingBlockEnd: string;
  readonly paddingBlockStart: string;
  readonly paddingBottom: string;
  readonly paddingInline: string;
  readonly paddingInlineEnd: string;
  readonly paddingInlineStart: string;
  readonly paddingLeft: string;
  readonly paddingRight: string;
  readonly paddingTop: string;
  readonly pageBreakAfter: string;
  readonly pageBreakBefore: string;
  readonly pageBreakInside: string;
  readonly paintOrder: string;
  readonly parentRule: CSSRule | null;
  readonly perspective: string;
  readonly perspectiveOrigin: string;
  readonly placeContent: string;
  readonly placeItems: string;
  readonly placeSelf: string;
  readonly pointerEvents: string;
  readonly position: string;
  readonly printColorAdjust: string;
  readonly quotes: string;
  readonly resize: string;
  readonly right: string;
  readonly rotate: string;
  readonly rowGap: string;
  readonly rubyPosition: string;
  readonly scale: string;
  readonly scrollBehavior: string;
  readonly scrollMargin: string;
  readonly scrollMarginBlock: string;
  readonly scrollMarginBlockEnd: string;
  readonly scrollMarginBlockStart: string;
  readonly scrollMarginBottom: string;
  readonly scrollMarginInline: string;
  readonly scrollMarginInlineEnd: string;
  readonly scrollMarginInlineStart: string;
  readonly scrollMarginLeft: string;
  readonly scrollMarginRight: string;
  readonly scrollMarginTop: string;
  readonly scrollPadding: string;
  readonly scrollPaddingBlock: string;
  readonly scrollPaddingBlockEnd: string;
  readonly scrollPaddingBlockStart: string;
  readonly scrollPaddingBottom: string;
  readonly scrollPaddingInline: string;
  readonly scrollPaddingInlineEnd: string;
  readonly scrollPaddingInlineStart: string;
  readonly scrollPaddingLeft: string;
  readonly scrollPaddingRight: string;
  readonly scrollPaddingTop: string;
  readonly scrollSnapAlign: string;
  readonly scrollSnapStop: string;
  readonly scrollSnapType: string;
  readonly scrollbarGutter: string;
  readonly shapeImageThreshold: string;
  readonly shapeMargin: string;
  readonly shapeOutside: string;
  readonly shapeRendering: string;
  readonly stopColor: string;
  readonly stopOpacity: string;
  readonly stroke: string;
  readonly strokeDasharray: string;
  readonly strokeDashoffset: string;
  readonly strokeLinecap: string;
  readonly strokeLinejoin: string;
  readonly strokeMiterlimit: string;
  readonly strokeOpacity: string;
  readonly strokeWidth: string;
  readonly tabSize: string;
  readonly tableLayout: string;
  readonly textAlign: string;
  readonly textAlignLast: string;
  readonly textAnchor: string;
  readonly textCombineUpright: string;
  readonly textDecoration: string;
  readonly textDecorationColor: string;
  readonly textDecorationLine: string;
  readonly textDecorationSkipInk: string;
  readonly textDecorationStyle: string;
  readonly textDecorationThickness: string;
  readonly textEmphasis: string;
  readonly textEmphasisColor: string;
  readonly textEmphasisPosition: string;
  readonly textEmphasisStyle: string;
  readonly textIndent: string;
  readonly textOrientation: string;
  readonly textOverflow: string;
  readonly textRendering: string;
  readonly textShadow: string;
  readonly textTransform: string;
  readonly textUnderlineOffset: string;
  readonly textUnderlinePosition: string;
  readonly top: string;
  readonly touchAction: string;
  readonly transform: string;
  readonly transformBox: string;
  readonly transformOrigin: string;
  readonly transformStyle: string;
  readonly transition: string;
  readonly transitionDelay: string;
  readonly transitionDuration: string;
  readonly transitionProperty: string;
  readonly transitionTimingFunction: string;
  readonly translate: string;
  readonly unicodeBidi: string;
  readonly userSelect: string;
  readonly verticalAlign: string;
  readonly visibility: string;
  /** @deprecated This is a legacy alias of `alignContent`. */
  readonly webkitAlignContent: string;
  /** @deprecated This is a legacy alias of `alignItems`. */
  readonly webkitAlignItems: string;
  /** @deprecated This is a legacy alias of `alignSelf`. */
  readonly webkitAlignSelf: string;
  /** @deprecated This is a legacy alias of `animation`. */
  readonly webkitAnimation: string;
  /** @deprecated This is a legacy alias of `animationDelay`. */
  readonly webkitAnimationDelay: string;
  /** @deprecated This is a legacy alias of `animationDirection`. */
  readonly webkitAnimationDirection: string;
  /** @deprecated This is a legacy alias of `animationDuration`. */
  readonly webkitAnimationDuration: string;
  /** @deprecated This is a legacy alias of `animationFillMode`. */
  readonly webkitAnimationFillMode: string;
  /** @deprecated This is a legacy alias of `animationIterationCount`. */
  readonly webkitAnimationIterationCount: string;
  /** @deprecated This is a legacy alias of `animationName`. */
  readonly webkitAnimationName: string;
  /** @deprecated This is a legacy alias of `animationPlayState`. */
  readonly webkitAnimationPlayState: string;
  /** @deprecated This is a legacy alias of `animationTimingFunction`. */
  readonly webkitAnimationTimingFunction: string;
  /** @deprecated This is a legacy alias of `appearance`. */
  readonly webkitAppearance: string;
  /** @deprecated This is a legacy alias of `backfaceVisibility`. */
  readonly webkitBackfaceVisibility: string;
  /** @deprecated This is a legacy alias of `backgroundClip`. */
  readonly webkitBackgroundClip: string;
  /** @deprecated This is a legacy alias of `backgroundOrigin`. */
  readonly webkitBackgroundOrigin: string;
  /** @deprecated This is a legacy alias of `backgroundSize`. */
  readonly webkitBackgroundSize: string;
  /** @deprecated This is a legacy alias of `borderBottomLeftRadius`. */
  readonly webkitBorderBottomLeftRadius: string;
  /** @deprecated This is a legacy alias of `borderBottomRightRadius`. */
  readonly webkitBorderBottomRightRadius: string;
  /** @deprecated This is a legacy alias of `borderRadius`. */
  readonly webkitBorderRadius: string;
  /** @deprecated This is a legacy alias of `borderTopLeftRadius`. */
  readonly webkitBorderTopLeftRadius: string;
  /** @deprecated This is a legacy alias of `borderTopRightRadius`. */
  readonly webkitBorderTopRightRadius: string;
  /** @deprecated This is a legacy alias of `boxAlign`. */
  readonly webkitBoxAlign: string;
  /** @deprecated This is a legacy alias of `boxFlex`. */
  readonly webkitBoxFlex: string;
  /** @deprecated This is a legacy alias of `boxOrdinalGroup`. */
  readonly webkitBoxOrdinalGroup: string;
  /** @deprecated This is a legacy alias of `boxOrient`. */
  readonly webkitBoxOrient: string;
  /** @deprecated This is a legacy alias of `boxPack`. */
  readonly webkitBoxPack: string;
  /** @deprecated This is a legacy alias of `boxShadow`. */
  readonly webkitBoxShadow: string;
  /** @deprecated This is a legacy alias of `boxSizing`. */
  readonly webkitBoxSizing: string;
  /** @deprecated This is a legacy alias of `filter`. */
  readonly webkitFilter: string;
  /** @deprecated This is a legacy alias of `flex`. */
  readonly webkitFlex: string;
  /** @deprecated This is a legacy alias of `flexBasis`. */
  readonly webkitFlexBasis: string;
  /** @deprecated This is a legacy alias of `flexDirection`. */
  readonly webkitFlexDirection: string;
  /** @deprecated This is a legacy alias of `flexFlow`. */
  readonly webkitFlexFlow: string;
  /** @deprecated This is a legacy alias of `flexGrow`. */
  readonly webkitFlexGrow: string;
  /** @deprecated This is a legacy alias of `flexShrink`. */
  readonly webkitFlexShrink: string;
  /** @deprecated This is a legacy alias of `flexWrap`. */
  readonly webkitFlexWrap: string;
  /** @deprecated This is a legacy alias of `justifyContent`. */
  readonly webkitJustifyContent: string;
  readonly webkitLineClamp: string;
  /** @deprecated This is a legacy alias of `mask`. */
  readonly webkitMask: string;
  /** @deprecated This is a legacy alias of `maskBorder`. */
  readonly webkitMaskBoxImage: string;
  /** @deprecated This is a legacy alias of `maskBorderOutset`. */
  readonly webkitMaskBoxImageOutset: string;
  /** @deprecated This is a legacy alias of `maskBorderRepeat`. */
  readonly webkitMaskBoxImageRepeat: string;
  /** @deprecated This is a legacy alias of `maskBorderSlice`. */
  readonly webkitMaskBoxImageSlice: string;
  /** @deprecated This is a legacy alias of `maskBorderSource`. */
  readonly webkitMaskBoxImageSource: string;
  /** @deprecated This is a legacy alias of `maskBorderWidth`. */
  readonly webkitMaskBoxImageWidth: string;
  /** @deprecated This is a legacy alias of `maskClip`. */
  readonly webkitMaskClip: string;
  readonly webkitMaskComposite: string;
  /** @deprecated This is a legacy alias of `maskImage`. */
  readonly webkitMaskImage: string;
  /** @deprecated This is a legacy alias of `maskOrigin`. */
  readonly webkitMaskOrigin: string;
  /** @deprecated This is a legacy alias of `maskPosition`. */
  readonly webkitMaskPosition: string;
  /** @deprecated This is a legacy alias of `maskRepeat`. */
  readonly webkitMaskRepeat: string;
  /** @deprecated This is a legacy alias of `maskSize`. */
  readonly webkitMaskSize: string;
  /** @deprecated This is a legacy alias of `order`. */
  readonly webkitOrder: string;
  /** @deprecated This is a legacy alias of `perspective`. */
  readonly webkitPerspective: string;
  /** @deprecated This is a legacy alias of `perspectiveOrigin`. */
  readonly webkitPerspectiveOrigin: string;
  readonly webkitTextFillColor: string;
  readonly webkitTextStroke: string;
  readonly webkitTextStrokeColor: string;
  readonly webkitTextStrokeWidth: string;
  /** @deprecated This is a legacy alias of `transform`. */
  readonly webkitTransform: string;
  /** @deprecated This is a legacy alias of `transformOrigin`. */
  readonly webkitTransformOrigin: string;
  /** @deprecated This is a legacy alias of `transformStyle`. */
  readonly webkitTransformStyle: string;
  /** @deprecated This is a legacy alias of `transition`. */
  readonly webkitTransition: string;
  /** @deprecated This is a legacy alias of `transitionDelay`. */
  readonly webkitTransitionDelay: string;
  /** @deprecated This is a legacy alias of `transitionDuration`. */
  readonly webkitTransitionDuration: string;
  /** @deprecated This is a legacy alias of `transitionProperty`. */
  readonly webkitTransitionProperty: string;
  /** @deprecated This is a legacy alias of `transitionTimingFunction`. */
  readonly webkitTransitionTimingFunction: string;
  /** @deprecated This is a legacy alias of `userSelect`. */
  readonly webkitUserSelect: string;
  readonly whiteSpace: string;
  readonly widows: string;
  readonly width: string;
  readonly willChange: string;
  readonly wordBreak: string;
  readonly wordSpacing: string;
  /** @deprecated */
  readonly wordWrap: string;
  readonly writingMode: string;
  readonly zIndex: string;
  getPropertyPriority(property: string): string;
  getPropertyValue(property: string): string;
  item(index: number): string;
  removeProperty(property: string): string;
  setProperty(property: string, value: string | null, priority?: string): void;
  readonly [index: number]: string;
}

declare const CSSStyleDeclaration: {
  readonly prototype: CSSStyleDeclaration;
  new (): CSSStyleDeclaration;
};

/** CSSStyleRule represents a single CSS style rule. It implements the CSSRule interface with a type value of 1 (CSSRule.STYLE_RULE). */
interface CSSStyleRule extends CSSRule {
  readonly selectorText: string;
  readonly style: CSSStyleDeclaration;
}

declare const CSSStyleRule: {
  readonly prototype: CSSStyleRule;
  new (): CSSStyleRule;
};

/** A single CSS style sheet. It inherits properties and methods from its parent, StyleSheet. */
interface CSSStyleSheet extends StyleSheet {
  readonly cssRules: CSSRuleList;
  readonly ownerRule: CSSRule | null;
  /** @deprecated */
  readonly rules: CSSRuleList;
  /** @deprecated */
  addRule(selector?: string, style?: string, index?: number): number;
  deleteRule(index: number): void;
  insertRule(rule: string, index?: number): number;
  /** @deprecated */
  removeRule(index?: number): void;
}

declare const CSSStyleSheet: {
  readonly prototype: CSSStyleSheet;
  new (options?: CSSStyleSheetInit): CSSStyleSheet;
};

/** An object representing a single CSS @supports at-rule. It implements the CSSConditionRule interface, and therefore the CSSRule and CSSGroupingRule interfaces with a type value of 12 (CSSRule.SUPPORTS_RULE). */
interface CSSSupportsRule extends CSSConditionRule {}

declare const CSSSupportsRule: {
  readonly prototype: CSSSupportsRule;
  new (): CSSSupportsRule;
};

interface CSSTransition extends Animation {
  readonly transitionProperty: string;
  addEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: CSSTransition, ev: AnimationEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AnimationEventMap>(
    type: K,
    listener: (this: CSSTransition, ev: AnimationEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const CSSTransition: {
  readonly prototype: CSSTransition;
  new (): CSSTransition;
};

/**
 * Provides a storage mechanism for Request / Response object pairs that are cached, for example as part of the ServiceWorker life cycle. Note that the Cache interface is exposed to windowed scopes as well as workers. You don't have to use it in conjunction with service workers, even though it is defined in the service worker spec.
 * Available only in secure contexts.
 */
interface Cache {
  add(request: RequestInfo | URL): Promise<void>;
  addAll(requests: readonly RequestInfo[]): Promise<void>;
  delete(
    request: RequestInfo | URL,
    options?: CacheQueryOptions
  ): Promise<boolean>;
  keys(
    request?: RequestInfo | URL,
    options?: CacheQueryOptions
  ): Promise<ReadonlyArray<Request>>;
  match(
    request: RequestInfo | URL,
    options?: CacheQueryOptions
  ): Promise<Response | undefined>;
  matchAll(
    request?: RequestInfo | URL,
    options?: CacheQueryOptions
  ): Promise<ReadonlyArray<Response>>;
  put(request: RequestInfo | URL, response: Response): Promise<void>;
}

declare const Cache: {
  readonly prototype: Cache;
  new (): Cache;
};

/**
 * The storage for Cache objects.
 * Available only in secure contexts.
 */
interface CacheStorage {
  delete(cacheName: string): Promise<boolean>;
  has(cacheName: string): Promise<boolean>;
  keys(): Promise<readonly string[]>;
  match(
    request: RequestInfo | URL,
    options?: MultiCacheQueryOptions
  ): Promise<Response | undefined>;
  open(cacheName: string): Promise<Cache>;
}

declare const CacheStorage: {
  readonly prototype: CacheStorage;
  new (): CacheStorage;
};

interface CanvasCaptureMediaStreamTrack extends MediaStreamTrack {
  readonly canvas: HTMLCanvasElement;
  requestFrame(): void;
  addEventListener<K extends keyof MediaStreamTrackEventMap>(
    type: K,
    listener: (
      this: CanvasCaptureMediaStreamTrack,
      ev: MediaStreamTrackEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaStreamTrackEventMap>(
    type: K,
    listener: (
      this: CanvasCaptureMediaStreamTrack,
      ev: MediaStreamTrackEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const CanvasCaptureMediaStreamTrack: {
  readonly prototype: CanvasCaptureMediaStreamTrack;
  new (): CanvasCaptureMediaStreamTrack;
};

interface CanvasCompositing {
  readonly globalAlpha: number;
  readonly globalCompositeOperation: GlobalCompositeOperation;
}

interface CanvasDrawImage {
  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(
    image: CanvasImageSource,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void;
  drawImage(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void;
}

interface CanvasDrawPath {
  beginPath(): void;
  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  fill(fillRule?: CanvasFillRule): void;
  fill(path: Path2D, fillRule?: CanvasFillRule): void;
  isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
  isPointInPath(
    path: Path2D,
    x: number,
    y: number,
    fillRule?: CanvasFillRule
  ): boolean;
  isPointInStroke(x: number, y: number): boolean;
  isPointInStroke(path: Path2D, x: number, y: number): boolean;
  stroke(): void;
  stroke(path: Path2D): void;
}

interface CanvasFillStrokeStyles {
  readonly fillStyle: string | CanvasGradient | CanvasPattern;
  readonly strokeStyle: string | CanvasGradient | CanvasPattern;
  createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
  createLinearGradient(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): CanvasGradient;
  createPattern(
    image: CanvasImageSource,
    repetition: string | null
  ): CanvasPattern | null;
  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ): CanvasGradient;
}

interface CanvasFilters {
  readonly filter: string;
}

/** An opaque object describing a gradient. It is returned by the methods CanvasRenderingContext2D.createLinearGradient() or CanvasRenderingContext2D.createRadialGradient(). */
interface CanvasGradient {
  /**
   * Adds a color stop with the given color to the gradient at the given offset. 0.0 is the offset at one end of the gradient, 1.0 is the offset at the other end.
   *
   * Throws an "IndexSizeError" DOMException if the offset is out of range. Throws a "SyntaxError" DOMException if the color cannot be parsed.
   */
  addColorStop(offset: number, color: string): void;
}

declare const CanvasGradient: {
  readonly prototype: CanvasGradient;
  new (): CanvasGradient;
};

interface CanvasImageData {
  createImageData(
    sw: number,
    sh: number,
    settings?: ImageDataSettings
  ): ImageData;
  createImageData(imagedata: ImageData): ImageData;
  getImageData(
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    settings?: ImageDataSettings
  ): ImageData;
  putImageData(imagedata: ImageData, dx: number, dy: number): void;
  putImageData(
    imagedata: ImageData,
    dx: number,
    dy: number,
    dirtyX: number,
    dirtyY: number,
    dirtyWidth: number,
    dirtyHeight: number
  ): void;
}

interface CanvasImageSmoothing {
  readonly imageSmoothingEnabled: boolean;
  readonly imageSmoothingQuality: ImageSmoothingQuality;
}

interface CanvasPath {
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean
  ): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number
  ): void;
  closePath(): void;
  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean
  ): void;
  lineTo(x: number, y: number): void;
  moveTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  rect(x: number, y: number, w: number, h: number): void;
}

interface CanvasPathDrawingStyles {
  readonly lineCap: CanvasLineCap;
  readonly lineDashOffset: number;
  readonly lineJoin: CanvasLineJoin;
  readonly lineWidth: number;
  readonly miterLimit: number;
  getLineDash(): readonly number[];
  setLineDash(segments: readonly number[]): void;
}

/** An opaque object describing a pattern, based on an image, a canvas, or a video, created by the CanvasRenderingContext2D.createPattern() method. */
interface CanvasPattern {
  /** Sets the transformation matrix that will be used when rendering the pattern during a fill or stroke painting operation. */
  setTransform(transform?: DOMMatrix2DInit): void;
}

declare const CanvasPattern: {
  readonly prototype: CanvasPattern;
  new (): CanvasPattern;
};

interface CanvasRect {
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
}

/** The CanvasRenderingContext2D interface, part of the Canvas API, provides the 2D rendering context for the drawing surface of a <canvas> element. It is used for drawing shapes, text, images, and other objects. */
interface CanvasRenderingContext2D
  extends CanvasCompositing,
    CanvasDrawImage,
    CanvasDrawPath,
    CanvasFillStrokeStyles,
    CanvasFilters,
    CanvasImageData,
    CanvasImageSmoothing,
    CanvasPath,
    CanvasPathDrawingStyles,
    CanvasRect,
    CanvasShadowStyles,
    CanvasState,
    CanvasText,
    CanvasTextDrawingStyles,
    CanvasTransform,
    CanvasUserInterface {
  readonly canvas: HTMLCanvasElement;
  getContextAttributes(): CanvasRenderingContext2DSettings;
}

declare const CanvasRenderingContext2D: {
  readonly prototype: CanvasRenderingContext2D;
  new (): CanvasRenderingContext2D;
};

interface CanvasShadowStyles {
  readonly shadowBlur: number;
  readonly shadowColor: string;
  readonly shadowOffsetX: number;
  readonly shadowOffsetY: number;
}

interface CanvasState {
  restore(): void;
  save(): void;
}

interface CanvasText {
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
}

interface CanvasTextDrawingStyles {
  readonly direction: CanvasDirection;
  readonly font: string;
  readonly textAlign: CanvasTextAlign;
  readonly textBaseline: CanvasTextBaseline;
}

interface CanvasTransform {
  getTransform(): DOMMatrix;
  resetTransform(): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void;
  setTransform(transform?: DOMMatrix2DInit): void;
  transform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void;
  translate(x: number, y: number): void;
}

interface CanvasUserInterface {
  drawFocusIfNeeded(element: Element): void;
  drawFocusIfNeeded(path: Path2D, element: Element): void;
}

/** The ChannelMergerNode interface, often used in conjunction with its opposite, ChannelSplitterNode, reunites different mono inputs into a single output. Each input is used to fill a channel of the output. This is useful for accessing each channels separately, e.g. for performing channel mixing where gain must be separately controlled on each channel. */
interface ChannelMergerNode extends AudioNode {}

declare const ChannelMergerNode: {
  readonly prototype: ChannelMergerNode;
  new (
    context: BaseAudioContext,
    options?: ChannelMergerOptions
  ): ChannelMergerNode;
};

/** The ChannelSplitterNode interface, often used in conjunction with its opposite, ChannelMergerNode, separates the different channels of an audio source into a set of mono outputs. This is useful for accessing each channel separately, e.g. for performing channel mixing where gain must be separately controlled on each channel. */
interface ChannelSplitterNode extends AudioNode {}

declare const ChannelSplitterNode: {
  readonly prototype: ChannelSplitterNode;
  new (
    context: BaseAudioContext,
    options?: ChannelSplitterOptions
  ): ChannelSplitterNode;
};

/** The CharacterData abstract interface represents a Node object that contains characters. This is an abstract interface, meaning there aren't any object of type CharacterData: it is implemented by other interfaces, like Text, Comment, or ProcessingInstruction which aren't abstract. */
interface CharacterData extends Node, ChildNode, NonDocumentTypeChildNode {
  readonly data: string;
  readonly length: number;
  readonly ownerDocument: Document;
  appendData(data: string): void;
  deleteData(offset: number, count: number): void;
  insertData(offset: number, data: string): void;
  replaceData(offset: number, count: number, data: string): void;
  substringData(offset: number, count: number): string;
}

declare const CharacterData: {
  readonly prototype: CharacterData;
  new (): CharacterData;
};

interface ChildNode extends Node {
  /**
   * Inserts nodes just after node, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  after(...nodes: readonly (Node | string)[]): void;
  /**
   * Inserts nodes just before node, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  before(...nodes: readonly (Node | string)[]): void;
  /** Removes node. */
  remove(): void;
  /**
   * Replaces node with nodes, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  replaceWith(...nodes: readonly (Node | string)[]): void;
}

/** @deprecated */
interface ClientRect extends DOMRect {}

/** Available only in secure contexts. */
interface Clipboard extends EventTarget {
  read(): Promise<ClipboardItems>;
  readText(): Promise<string>;
  write(data: ClipboardItems): Promise<void>;
  writeText(data: string): Promise<void>;
}

declare const Clipboard: {
  readonly prototype: Clipboard;
  new (): Clipboard;
};

/** Events providing information related to modification of the clipboard, that is cut, copy, and paste events. */
interface ClipboardEvent extends Event {
  readonly clipboardData: DataTransfer | null;
}

declare const ClipboardEvent: {
  readonly prototype: ClipboardEvent;
  new (type: string, eventInitDict?: ClipboardEventInit): ClipboardEvent;
};

/** Available only in secure contexts. */
interface ClipboardItem {
  readonly types: ReadonlyArray<string>;
  getType(type: string): Promise<Blob>;
}

declare const ClipboardItem: {
  readonly prototype: ClipboardItem;
  new (
    items: Record<string, string | Blob | PromiseLike<string | Blob>>,
    options?: ClipboardItemOptions
  ): ClipboardItem;
};

/** A CloseEvent is sent to clients using WebSockets when the connection is closed. This is delivered to the listener indicated by the WebSocket object's onclose attribute. */
interface CloseEvent extends Event {
  /** Returns the WebSocket connection close code provided by the server. */
  readonly code: number;
  /** Returns the WebSocket connection close reason provided by the server. */
  readonly reason: string;
  /** Returns true if the connection closed cleanly; false otherwise. */
  readonly wasClean: boolean;
}

declare const CloseEvent: {
  readonly prototype: CloseEvent;
  new (type: string, eventInitDict?: CloseEventInit): CloseEvent;
};

/** Textual notations within markup; although it is generally not visually shown, such comments are available to be read in the source view. */
interface Comment extends CharacterData {}

declare const Comment: {
  readonly prototype: Comment;
  new (data?: string): Comment;
};

/** The DOM CompositionEvent represents events that occur due to the user indirectly entering text. */
interface CompositionEvent extends UIEvent {
  readonly data: string;
  /** @deprecated */
  initCompositionEvent(
    typeArg: string,
    bubblesArg?: boolean,
    cancelableArg?: boolean,
    viewArg?: WindowProxy | null,
    dataArg?: string
  ): void;
}

declare const CompositionEvent: {
  readonly prototype: CompositionEvent;
  new (type: string, eventInitDict?: CompositionEventInit): CompositionEvent;
};

interface ConstantSourceNode extends AudioScheduledSourceNode {
  readonly offset: AudioParam;
  addEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(
    type: K,
    listener: (
      this: ConstantSourceNode,
      ev: AudioScheduledSourceNodeEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(
    type: K,
    listener: (
      this: ConstantSourceNode,
      ev: AudioScheduledSourceNodeEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const ConstantSourceNode: {
  readonly prototype: ConstantSourceNode;
  new (
    context: BaseAudioContext,
    options?: ConstantSourceOptions
  ): ConstantSourceNode;
};

/** An AudioNode that performs a Linear Convolution on a given AudioBuffer, often used to achieve a reverb effect. A ConvolverNode always has exactly one input and one output. */
interface ConvolverNode extends AudioNode {
  readonly buffer: AudioBuffer | null;
  readonly normalize: boolean;
}

declare const ConvolverNode: {
  readonly prototype: ConvolverNode;
  new (context: BaseAudioContext, options?: ConvolverOptions): ConvolverNode;
};

/** This Streams API interface provides a built-in byte length queuing strategy that can be used when constructing streams. */
interface CountQueuingStrategy extends QueuingStrategy {
  readonly highWaterMark: number;
  readonly size: QueuingStrategySize;
}

declare const CountQueuingStrategy: {
  readonly prototype: CountQueuingStrategy;
  new (init: QueuingStrategyInit): CountQueuingStrategy;
};

/** Available only in secure contexts. */
interface Credential {
  readonly id: string;
  readonly type: string;
}

declare const Credential: {
  readonly prototype: Credential;
  new (): Credential;
};

/** Available only in secure contexts. */
interface CredentialsContainer {
  create(options?: CredentialCreationOptions): Promise<Credential | null>;
  get(options?: CredentialRequestOptions): Promise<Credential | null>;
  preventSilentAccess(): Promise<void>;
  store(credential: Credential): Promise<Credential>;
}

declare const CredentialsContainer: {
  readonly prototype: CredentialsContainer;
  new (): CredentialsContainer;
};

/** Basic cryptography features available in the current context. It allows access to a cryptographically strong random number generator and to cryptographic primitives. */
interface Crypto {
  /** Available only in secure contexts. */
  readonly subtle: SubtleCrypto;
  getRandomValues<T extends ArrayBufferView | null>(array: T): T;
  /** Available only in secure contexts. */
  randomUUID(): string;
}

declare const Crypto: {
  readonly prototype: Crypto;
  new (): Crypto;
};

/**
 * The CryptoKey dictionary of the Web Crypto API represents a cryptographic key.
 * Available only in secure contexts.
 */
interface CryptoKey {
  readonly algorithm: KeyAlgorithm;
  readonly extractable: boolean;
  readonly type: KeyType;
  readonly usages: readonly KeyUsage[];
}

declare const CryptoKey: {
  readonly prototype: CryptoKey;
  new (): CryptoKey;
};

interface CustomElementRegistry {
  define(
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions
  ): void;
  get(name: string): CustomElementConstructor | undefined;
  upgrade(root: Node): void;
  whenDefined(name: string): Promise<CustomElementConstructor>;
}

declare const CustomElementRegistry: {
  readonly prototype: CustomElementRegistry;
  new (): CustomElementRegistry;
};

interface CustomEvent<T = unknown> extends Event {
  /** Returns any custom data event was created with. Typically used for synthetic events. */
  readonly detail: T;
  /** @deprecated */
  initCustomEvent(
    type: string,
    bubbles?: boolean,
    cancelable?: boolean,
    detail?: T
  ): void;
}

declare const CustomEvent: {
  readonly prototype: CustomEvent;
  new <T>(type: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>;
};

/** An abnormal event (called an exception) which occurs as a result of calling a method or accessing a property of a web API. */
interface DOMException extends Error {
  readonly code: number;
  readonly message: string;
  readonly name: string;
  readonly ABORT_ERR: number;
  readonly DATA_CLONE_ERR: number;
  readonly DOMSTRING_SIZE_ERR: number;
  readonly HIERARCHY_REQUEST_ERR: number;
  readonly INDEX_SIZE_ERR: number;
  readonly INUSE_ATTRIBUTE_ERR: number;
  readonly INVALID_ACCESS_ERR: number;
  readonly INVALID_CHARACTER_ERR: number;
  readonly INVALID_MODIFICATION_ERR: number;
  readonly INVALID_NODE_TYPE_ERR: number;
  readonly INVALID_STATE_ERR: number;
  readonly NAMESPACE_ERR: number;
  readonly NETWORK_ERR: number;
  readonly NOT_FOUND_ERR: number;
  readonly NOT_SUPPORTED_ERR: number;
  readonly NO_DATA_ALLOWED_ERR: number;
  readonly NO_MODIFICATION_ALLOWED_ERR: number;
  readonly QUOTA_EXCEEDED_ERR: number;
  readonly SECURITY_ERR: number;
  readonly SYNTAX_ERR: number;
  readonly TIMEOUT_ERR: number;
  readonly TYPE_MISMATCH_ERR: number;
  readonly URL_MISMATCH_ERR: number;
  readonly VALIDATION_ERR: number;
  readonly WRONG_DOCUMENT_ERR: number;
}

declare const DOMException: {
  readonly prototype: DOMException;
  new (message?: string, name?: string): DOMException;
  readonly ABORT_ERR: number;
  readonly DATA_CLONE_ERR: number;
  readonly DOMSTRING_SIZE_ERR: number;
  readonly HIERARCHY_REQUEST_ERR: number;
  readonly INDEX_SIZE_ERR: number;
  readonly INUSE_ATTRIBUTE_ERR: number;
  readonly INVALID_ACCESS_ERR: number;
  readonly INVALID_CHARACTER_ERR: number;
  readonly INVALID_MODIFICATION_ERR: number;
  readonly INVALID_NODE_TYPE_ERR: number;
  readonly INVALID_STATE_ERR: number;
  readonly NAMESPACE_ERR: number;
  readonly NETWORK_ERR: number;
  readonly NOT_FOUND_ERR: number;
  readonly NOT_SUPPORTED_ERR: number;
  readonly NO_DATA_ALLOWED_ERR: number;
  readonly NO_MODIFICATION_ALLOWED_ERR: number;
  readonly QUOTA_EXCEEDED_ERR: number;
  readonly SECURITY_ERR: number;
  readonly SYNTAX_ERR: number;
  readonly TIMEOUT_ERR: number;
  readonly TYPE_MISMATCH_ERR: number;
  readonly URL_MISMATCH_ERR: number;
  readonly VALIDATION_ERR: number;
  readonly WRONG_DOCUMENT_ERR: number;
};

/** An object providing methods which are not dependent on any particular document. Such an object is returned by the Document.implementation property. */
interface DOMImplementation {
  createDocument(
    namespace: string | null,
    qualifiedName: string | null,
    doctype?: DocumentType | null
  ): XMLDocument;
  createDocumentType(
    qualifiedName: string,
    publicId: string,
    systemId: string
  ): DocumentType;
  createHTMLDocument(title?: string): Document;
  /** @deprecated */
  hasFeature(...args: readonly never[]): true;
}

declare const DOMImplementation: {
  readonly prototype: DOMImplementation;
  new (): DOMImplementation;
};

interface DOMMatrix extends DOMMatrixReadOnly {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f: number;
  readonly m11: number;
  readonly m12: number;
  readonly m13: number;
  readonly m14: number;
  readonly m21: number;
  readonly m22: number;
  readonly m23: number;
  readonly m24: number;
  readonly m31: number;
  readonly m32: number;
  readonly m33: number;
  readonly m34: number;
  readonly m41: number;
  readonly m42: number;
  readonly m43: number;
  readonly m44: number;
  invertSelf(): DOMMatrix;
  multiplySelf(other?: DOMMatrixInit): DOMMatrix;
  preMultiplySelf(other?: DOMMatrixInit): DOMMatrix;
  rotateAxisAngleSelf(
    x?: number,
    y?: number,
    z?: number,
    angle?: number
  ): DOMMatrix;
  rotateFromVectorSelf(x?: number, y?: number): DOMMatrix;
  rotateSelf(rotX?: number, rotY?: number, rotZ?: number): DOMMatrix;
  scale3dSelf(
    scale?: number,
    originX?: number,
    originY?: number,
    originZ?: number
  ): DOMMatrix;
  scaleSelf(
    scaleX?: number,
    scaleY?: number,
    scaleZ?: number,
    originX?: number,
    originY?: number,
    originZ?: number
  ): DOMMatrix;
  setMatrixValue(transformList: string): DOMMatrix;
  skewXSelf(sx?: number): DOMMatrix;
  skewYSelf(sy?: number): DOMMatrix;
  translateSelf(tx?: number, ty?: number, tz?: number): DOMMatrix;
}

declare const DOMMatrix: {
  readonly prototype: DOMMatrix;
  new (init?: string | readonly number[]): DOMMatrix;
  fromFloat32Array(array32: Float32Array): DOMMatrix;
  fromFloat64Array(array64: Float64Array): DOMMatrix;
  fromMatrix(other?: DOMMatrixInit): DOMMatrix;
};

type SVGMatrix = DOMMatrix;
declare const SVGMatrix: typeof DOMMatrix;

type WebKitCSSMatrix = DOMMatrix;
declare const WebKitCSSMatrix: typeof DOMMatrix;

interface DOMMatrixReadOnly {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f: number;
  readonly is2D: boolean;
  readonly isIdentity: boolean;
  readonly m11: number;
  readonly m12: number;
  readonly m13: number;
  readonly m14: number;
  readonly m21: number;
  readonly m22: number;
  readonly m23: number;
  readonly m24: number;
  readonly m31: number;
  readonly m32: number;
  readonly m33: number;
  readonly m34: number;
  readonly m41: number;
  readonly m42: number;
  readonly m43: number;
  readonly m44: number;
  flipX(): DOMMatrix;
  flipY(): DOMMatrix;
  inverse(): DOMMatrix;
  multiply(other?: DOMMatrixInit): DOMMatrix;
  rotate(rotX?: number, rotY?: number, rotZ?: number): DOMMatrix;
  rotateAxisAngle(
    x?: number,
    y?: number,
    z?: number,
    angle?: number
  ): DOMMatrix;
  rotateFromVector(x?: number, y?: number): DOMMatrix;
  scale(
    scaleX?: number,
    scaleY?: number,
    scaleZ?: number,
    originX?: number,
    originY?: number,
    originZ?: number
  ): DOMMatrix;
  scale3d(
    scale?: number,
    originX?: number,
    originY?: number,
    originZ?: number
  ): DOMMatrix;
  /** @deprecated */
  scaleNonUniform(scaleX?: number, scaleY?: number): DOMMatrix;
  skewX(sx?: number): DOMMatrix;
  skewY(sy?: number): DOMMatrix;
  toFloat32Array(): Float32Array;
  toFloat64Array(): Float64Array;
  toJSON(): unknown;
  transformPoint(point?: DOMPointInit): DOMPoint;
  translate(tx?: number, ty?: number, tz?: number): DOMMatrix;
  toString(): string;
}

declare const DOMMatrixReadOnly: {
  readonly prototype: DOMMatrixReadOnly;
  new (init?: string | readonly number[]): DOMMatrixReadOnly;
  fromFloat32Array(array32: Float32Array): DOMMatrixReadOnly;
  fromFloat64Array(array64: Float64Array): DOMMatrixReadOnly;
  fromMatrix(other?: DOMMatrixInit): DOMMatrixReadOnly;
  toString(): string;
};

/** Provides the ability to parse XML or HTML source code from a string into a DOM Document. */
interface DOMParser {
  /**
   * Parses string using either the HTML or XML parser, according to type, and returns the resulting Document. type can be "text/html" (which will invoke the HTML parser), or any of "text/xml", "application/xml", "application/xhtml+xml", or "image/svg+xml" (which will invoke the XML parser).
   *
   * For the XML parser, if string cannot be parsed, then the returned Document will contain elements describing the resulting error.
   *
   * Note that script elements are not evaluated during parsing, and the resulting document's encoding will always be UTF-8.
   *
   * Values other than the above for type will cause a TypeError exception to be thrown.
   */
  parseFromString(string: string, type: DOMParserSupportedType): Document;
}

declare const DOMParser: {
  readonly prototype: DOMParser;
  new (): DOMParser;
};

interface DOMPoint extends DOMPointReadOnly {
  readonly w: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

declare const DOMPoint: {
  readonly prototype: DOMPoint;
  new (x?: number, y?: number, z?: number, w?: number): DOMPoint;
  fromPoint(other?: DOMPointInit): DOMPoint;
};

type SVGPoint = DOMPoint;
declare const SVGPoint: typeof DOMPoint;

interface DOMPointReadOnly {
  readonly w: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  matrixTransform(matrix?: DOMMatrixInit): DOMPoint;
  toJSON(): unknown;
}

declare const DOMPointReadOnly: {
  readonly prototype: DOMPointReadOnly;
  new (x?: number, y?: number, z?: number, w?: number): DOMPointReadOnly;
  fromPoint(other?: DOMPointInit): DOMPointReadOnly;
};

interface DOMQuad {
  readonly p1: DOMPoint;
  readonly p2: DOMPoint;
  readonly p3: DOMPoint;
  readonly p4: DOMPoint;
  getBounds(): DOMRect;
  toJSON(): unknown;
}

declare const DOMQuad: {
  readonly prototype: DOMQuad;
  new (
    p1?: DOMPointInit,
    p2?: DOMPointInit,
    p3?: DOMPointInit,
    p4?: DOMPointInit
  ): DOMQuad;
  fromQuad(other?: DOMQuadInit): DOMQuad;
  fromRect(other?: DOMRectInit): DOMQuad;
};

interface DOMRect extends DOMRectReadOnly {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

declare const DOMRect: {
  readonly prototype: DOMRect;
  new (x?: number, y?: number, width?: number, height?: number): DOMRect;
  fromRect(other?: DOMRectInit): DOMRect;
};

type SVGRect = DOMRect;
declare const SVGRect: typeof DOMRect;

interface DOMRectList {
  readonly length: number;
  item(index: number): DOMRect | null;
  readonly [index: number]: DOMRect;
}

declare const DOMRectList: {
  readonly prototype: DOMRectList;
  new (): DOMRectList;
};

interface DOMRectReadOnly {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  toJSON(): unknown;
}

declare const DOMRectReadOnly: {
  readonly prototype: DOMRectReadOnly;
  new (
    x?: number,
    y?: number,
    width?: number,
    height?: number
  ): DOMRectReadOnly;
  fromRect(other?: DOMRectInit): DOMRectReadOnly;
};

/** A type returned by some APIs which contains a list of DOMString (strings). */
interface DOMStringList {
  /** Returns the number of strings in strings. */
  readonly length: number;
  /** Returns true if strings contains string, and false otherwise. */
  contains(string: string): boolean;
  /** Returns the string with index index from strings. */
  item(index: number): string | null;
  readonly [index: number]: string;
}

declare const DOMStringList: {
  readonly prototype: DOMStringList;
  new (): DOMStringList;
};

/** Used by the dataset HTML attribute to represent data for custom attributes added to elements. */
interface DOMStringMap {
  readonly [name: string]: string | undefined;
}

declare const DOMStringMap: {
  readonly prototype: DOMStringMap;
  new (): DOMStringMap;
};

/** A set of space-separated tokens. Such a set is returned by Element.classList, HTMLLinkElement.relList, HTMLAnchorElement.relList, HTMLAreaElement.relList, HTMLIframeElement.sandbox, or HTMLOutputElement.htmlFor. It is indexed beginning with 0 as with JavaScript Array objects. DOMTokenList is always case-sensitive. */
interface DOMTokenList {
  /** Returns the number of tokens. */
  readonly length: number;
  /**
   * Returns the associated set as string.
   *
   * Can be set, to change the associated attribute.
   */
  readonly value: string;
  toString(): string;
  /**
   * Adds all arguments passed, except those already present.
   *
   * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
   *
   * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
   */
  add(...tokens: readonly string[]): void;
  /** Returns true if token is present, and false otherwise. */
  contains(token: string): boolean;
  /** Returns the token with index index. */
  item(index: number): string | null;
  /**
   * Removes arguments passed, if they are present.
   *
   * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
   *
   * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
   */
  remove(...tokens: readonly string[]): void;
  /**
   * Replaces token with newToken.
   *
   * Returns true if token was replaced with newToken, and false otherwise.
   *
   * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
   *
   * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
   */
  replace(token: string, newToken: string): boolean;
  /**
   * Returns true if token is in the associated attribute's supported tokens. Returns false otherwise.
   *
   * Throws a TypeError if the associated attribute has no supported tokens defined.
   */
  supports(token: string): boolean;
  /**
   * If force is not given, "toggles" token, removing it if it's present and adding it if it's not present. If force is true, adds token (same as add()). If force is false, removes token (same as remove()).
   *
   * Returns true if token is now present, and false otherwise.
   *
   * Throws a "SyntaxError" DOMException if token is empty.
   *
   * Throws an "InvalidCharacterError" DOMException if token contains any spaces.
   */
  toggle(token: string, force?: boolean): boolean;
  forEach(
    callbackfn: (value: string, key: number, parent: DOMTokenList) => void,
    thisArg?: unknown
  ): void;
  readonly [index: number]: string;
}

declare const DOMTokenList: {
  readonly prototype: DOMTokenList;
  new (): DOMTokenList;
};

/** Used to hold the data that is being dragged during a drag and drop operation. It may hold one or more data items, each of one or more data types. For more information about drag and drop, see HTML Drag and Drop API. */
interface DataTransfer {
  /**
   * Returns the kind of operation that is currently selected. If the kind of operation isn't one of those that is allowed by the effectAllowed attribute, then the operation will fail.
   *
   * Can be set, to change the selected operation.
   *
   * The possible values are "none", "copy", "link", and "move".
   */
  readonly dropEffect: 'none' | 'copy' | 'link' | 'move';
  /**
   * Returns the kinds of operations that are to be allowed.
   *
   * Can be set (during the dragstart event), to change the allowed operations.
   *
   * The possible values are "none", "copy", "copyLink", "copyMove", "link", "linkMove", "move", "all", and "uninitialized",
   */
  readonly effectAllowed:
    | 'none'
    | 'copy'
    | 'copyLink'
    | 'copyMove'
    | 'link'
    | 'linkMove'
    | 'move'
    | 'all'
    | 'uninitialized';
  /** Returns a FileList of the files being dragged, if any. */
  readonly files: FileList;
  /** Returns a DataTransferItemList object, with the drag data. */
  readonly items: DataTransferItemList;
  /** Returns a frozen array listing the formats that were set in the dragstart event. In addition, if any files are being dragged, then one of the types will be the string "Files". */
  readonly types: ReadonlyArray<string>;
  /** Removes the data of the specified formats. Removes all data if the argument is omitted. */
  clearData(format?: string): void;
  /** Returns the specified data. If there is no such data, returns the empty string. */
  getData(format: string): string;
  /** Adds the specified data. */
  setData(format: string, data: string): void;
  /** Uses the given element to update the drag feedback, replacing any previously specified feedback. */
  setDragImage(image: Element, x: number, y: number): void;
}

declare const DataTransfer: {
  readonly prototype: DataTransfer;
  new (): DataTransfer;
};

/** One drag data item. During a drag operation, each drag event has a dataTransfer property which contains a list of drag data items. Each item in the list is a DataTransferItem object. */
interface DataTransferItem {
  /** Returns the drag data item kind, one of: "string", "file". */
  readonly kind: string;
  /** Returns the drag data item type string. */
  readonly type: string;
  /** Returns a File object, if the drag data item kind is File. */
  getAsFile(): File | null;
  /** Invokes the callback with the string data as the argument, if the drag data item kind is text. */
  getAsString(callback: FunctionStringCallback | null): void;
  webkitGetAsEntry(): FileSystemEntry | null;
}

declare const DataTransferItem: {
  readonly prototype: DataTransferItem;
  new (): DataTransferItem;
};

/** A list of DataTransferItem objects representing items being dragged. During a drag operation, each DragEvent has a dataTransfer property and that property is a DataTransferItemList. */
interface DataTransferItemList {
  /** Returns the number of items in the drag data store. */
  readonly length: number;
  /** Adds a new entry for the given data to the drag data store. If the data is plain text then a type string has to be provided also. */
  add(data: string, type: string): DataTransferItem | null;
  add(data: File): DataTransferItem | null;
  /** Removes all the entries in the drag data store. */
  clear(): void;
  /** Removes the indexth entry in the drag data store. */
  remove(index: number): void;
  readonly [index: number]: DataTransferItem;
}

declare const DataTransferItemList: {
  readonly prototype: DataTransferItemList;
  new (): DataTransferItemList;
};

/** A delay-line; an AudioNode audio-processing module that causes a delay between the arrival of an input data and its propagation to the output. */
interface DelayNode extends AudioNode {
  readonly delayTime: AudioParam;
}

declare const DelayNode: {
  readonly prototype: DelayNode;
  new (context: BaseAudioContext, options?: DelayOptions): DelayNode;
};

/**
 * The DeviceMotionEvent provides web developers with information about the speed of changes for the device's position and orientation.
 * Available only in secure contexts.
 */
interface DeviceMotionEvent extends Event {
  readonly acceleration: DeviceMotionEventAcceleration | null;
  readonly accelerationIncludingGravity: DeviceMotionEventAcceleration | null;
  readonly interval: number;
  readonly rotationRate: DeviceMotionEventRotationRate | null;
}

declare const DeviceMotionEvent: {
  readonly prototype: DeviceMotionEvent;
  new (type: string, eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
};

/** Available only in secure contexts. */
interface DeviceMotionEventAcceleration {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

/** Available only in secure contexts. */
interface DeviceMotionEventRotationRate {
  readonly alpha: number | null;
  readonly beta: number | null;
  readonly gamma: number | null;
}

/**
 * The DeviceOrientationEvent provides web developers with information from the physical orientation of the device running the web page.
 * Available only in secure contexts.
 */
interface DeviceOrientationEvent extends Event {
  readonly absolute: boolean;
  readonly alpha: number | null;
  readonly beta: number | null;
  readonly gamma: number | null;
}

declare const DeviceOrientationEvent: {
  readonly prototype: DeviceOrientationEvent;
  new (
    type: string,
    eventInitDict?: DeviceOrientationEventInit
  ): DeviceOrientationEvent;
};

interface DocumentEventMap
  extends DocumentAndElementEventHandlersEventMap,
    GlobalEventHandlersEventMap {
  readonly DOMContentLoaded: Event;
  readonly fullscreenchange: Event;
  readonly fullscreenerror: Event;
  readonly pointerlockchange: Event;
  readonly pointerlockerror: Event;
  readonly readystatechange: Event;
  readonly visibilitychange: Event;
}

/** Any web page loaded in the browser and serves as an entry point into the web page's content, which is the DOM tree. */
interface Document
  extends Node,
    DocumentAndElementEventHandlers,
    DocumentOrShadowRoot,
    FontFaceSource,
    GlobalEventHandlers,
    NonElementParentNode,
    ParentNode,
    XPathEvaluatorBase {
  /** Sets or gets the URL for the current document. */
  readonly URL: string;
  /**
   * Sets or gets the color of all active links in the document.
   * @deprecated
   */
  readonly alinkColor: string;
  /**
   * Returns a reference to the collection of elements contained by the object.
   * @deprecated
   */
  readonly all: HTMLAllCollection;
  /**
   * Retrieves a collection of all a objects that have a name and/or id property. Objects in this collection are in HTML source order.
   * @deprecated
   */
  readonly anchors: HTMLCollectionOf<HTMLAnchorElement>;
  /**
   * Retrieves a collection of all applet objects in the document.
   * @deprecated
   */
  readonly applets: HTMLCollection;
  /**
   * Deprecated. Sets or retrieves a value that indicates the background color behind the object.
   * @deprecated
   */
  readonly bgColor: string;
  /** Specifies the beginning and end of the document body. */
  readonly body: HTMLElement;
  /** Returns document's encoding. */
  readonly characterSet: string;
  /**
   * Gets or sets the character set used to encode the object.
   * @deprecated This is a legacy alias of `characterSet`.
   */
  readonly charset: string;
  /** Gets a value that indicates whether standards-compliant mode is switched on for the object. */
  readonly compatMode: string;
  /** Returns document's content type. */
  readonly contentType: string;
  /**
   * Returns the HTTP cookies that apply to the Document. If there are no cookies or cookies can't be applied to this resource, the empty string will be returned.
   *
   * Can be set, to add a new cookie to the element's set of HTTP cookies.
   *
   * If the contents are sandboxed into a unique origin (e.g. in an iframe with the sandbox attribute), a "SecurityError" DOMException will be thrown on getting and setting.
   */
  readonly cookie: string;
  /**
   * Returns the script element, or the SVG script element, that is currently executing, as long as the element represents a classic script. In the case of reentrant script execution, returns the one that most recently started executing amongst those that have not yet finished executing.
   *
   * Returns null if the Document is not currently executing a script or SVG script element (e.g., because the running script is an event handler, or a timeout), or if the currently executing script or SVG script element represents a module script.
   */
  readonly currentScript: HTMLOrSVGScriptElement | null;
  /** Returns the Window object of the active document. */
  readonly defaultView: (WindowProxy & typeof globalThis) | null;
  /** Sets or gets a value that indicates whether the document can be edited. */
  readonly designMode: string;
  /** Sets or retrieves a value that indicates the reading order of the object. */
  readonly dir: string;
  /** Gets an object representing the document type declaration associated with the current document. */
  readonly doctype: DocumentType | null;
  /** Gets a reference to the root node of the document. */
  readonly documentElement: HTMLElement;
  /** Returns document's URL. */
  readonly documentURI: string;
  /** Sets or gets the security domain of the document. */
  readonly domain: string;
  /** Retrieves a collection of all embed objects in the document. */
  readonly embeds: HTMLCollectionOf<HTMLEmbedElement>;
  /**
   * Sets or gets the foreground (text) color of the document.
   * @deprecated
   */
  readonly fgColor: string;
  /** Retrieves a collection, in source order, of all form objects in the document. */
  readonly forms: HTMLCollectionOf<HTMLFormElement>;
  /** @deprecated */
  readonly fullscreen: boolean;
  /** Returns true if document has the ability to display elements fullscreen and fullscreen is supported, or false otherwise. */
  readonly fullscreenEnabled: boolean;
  /** Returns the head element. */
  readonly head: HTMLHeadElement;
  readonly hidden: boolean;
  /** Retrieves a collection, in source order, of img objects in the document. */
  readonly images: HTMLCollectionOf<HTMLImageElement>;
  /** Gets the implementation object of the current document. */
  readonly implementation: DOMImplementation;
  /**
   * Returns the character encoding used to create the webpage that is loaded into the document object.
   * @deprecated This is a legacy alias of `characterSet`.
   */
  readonly inputEncoding: string;
  /** Gets the date that the page was last modified, if the page supplies one. */
  readonly lastModified: string;
  /**
   * Sets or gets the color of the document links.
   * @deprecated
   */
  readonly linkColor: string;
  /** Retrieves a collection of all a objects that specify the href property and all area objects in the document. */
  readonly links: HTMLCollectionOf<HTMLAnchorElement | HTMLAreaElement>;
  /** Contains information about the current URL. */
  get location(): Location;
  set location(href: string | Location);
  readonly onfullscreenchange: ((this: Document, ev: Event) => unknown) | null;
  readonly onfullscreenerror: ((this: Document, ev: Event) => unknown) | null;
  readonly onpointerlockchange: ((this: Document, ev: Event) => unknown) | null;
  readonly onpointerlockerror: ((this: Document, ev: Event) => unknown) | null;
  /**
   * Fires when the state of the object has changed.
   * @param ev The event
   */
  readonly onreadystatechange: ((this: Document, ev: Event) => unknown) | null;
  readonly onvisibilitychange: ((this: Document, ev: Event) => unknown) | null;
  readonly ownerDocument: null;
  readonly pictureInPictureEnabled: boolean;
  /** Return an HTMLCollection of the embed elements in the Document. */
  readonly plugins: HTMLCollectionOf<HTMLEmbedElement>;
  /** Retrieves a value that indicates the current state of the object. */
  readonly readyState: DocumentReadyState;
  /** Gets the URL of the location that referred the user to the current page. */
  readonly referrer: string;
  /** @deprecated */
  readonly rootElement: SVGSVGElement | null;
  /** Retrieves a collection of all script objects in the document. */
  readonly scripts: HTMLCollectionOf<HTMLScriptElement>;
  readonly scrollingElement: Element | null;
  readonly timeline: DocumentTimeline;
  /** Contains the title of the document. */
  readonly title: string;
  readonly visibilityState: DocumentVisibilityState;
  /**
   * Sets or gets the color of the links that the user has visited.
   * @deprecated
   */
  readonly vlinkColor: string;
  /**
   * Moves node from another document and returns it.
   *
   * If node is a document, throws a "NotSupportedError" DOMException or, if node is a shadow root, throws a "HierarchyRequestError" DOMException.
   */
  adoptNode<T extends Node>(node: T): T;
  /** @deprecated */
  captureEvents(): void;
  /** @deprecated */
  caretRangeFromPoint(x: number, y: number): Range | null;
  /** @deprecated */
  clear(): void;
  /** Closes an output stream and forces the sent data to display. */
  close(): void;
  /**
   * Creates an attribute object with a specified name.
   * @param name String that sets the attribute object's name.
   */
  createAttribute(localName: string): Attr;
  createAttributeNS(namespace: string | null, qualifiedName: string): Attr;
  /** Returns a CDATASection node whose data is data. */
  createCDATASection(data: string): CDATASection;
  /**
   * Creates a comment object with the specified data.
   * @param data Sets the comment object's data.
   */
  createComment(data: string): Comment;
  /** Creates a new document. */
  createDocumentFragment(): DocumentFragment;
  /**
   * Creates an instance of the element for the specified tag.
   * @param tagName The name of an element.
   */
  createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions
  ): HTMLElementTagNameMap[K];
  /** @deprecated */
  createElement<K extends keyof HTMLElementDeprecatedTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions
  ): HTMLElementDeprecatedTagNameMap[K];
  createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
  /**
   * Returns an element with namespace namespace. Its namespace prefix will be everything before ":" (U+003E) in qualifiedName or null. Its local name will be everything after ":" (U+003E) in qualifiedName or qualifiedName.
   *
   * If localName does not match the Name production an "InvalidCharacterError" DOMException will be thrown.
   *
   * If one of the following conditions is true a "NamespaceError" DOMException will be thrown:
   *
   * localName does not match the QName production.
   * Namespace prefix is not null and namespace is the empty string.
   * Namespace prefix is "xml" and namespace is not the XML namespace.
   * qualifiedName or namespace prefix is "xmlns" and namespace is not the XMLNS namespace.
   * namespace is the XMLNS namespace and neither qualifiedName nor namespace prefix is "xmlns".
   *
   * When supplied, options's is can be used to create a customized built-in element.
   */
  createElementNS(
    namespaceURI: 'http://www.w3.org/1999/xhtml',
    qualifiedName: string
  ): HTMLElement;
  createElementNS<K extends keyof SVGElementTagNameMap>(
    namespaceURI: 'http://www.w3.org/2000/svg',
    qualifiedName: K
  ): SVGElementTagNameMap[K];
  createElementNS(
    namespaceURI: 'http://www.w3.org/2000/svg',
    qualifiedName: string
  ): SVGElement;
  createElementNS(
    namespaceURI: string | null,
    qualifiedName: string,
    options?: ElementCreationOptions
  ): Element;
  createElementNS(
    namespace: string | null,
    qualifiedName: string,
    options?: string | ElementCreationOptions
  ): Element;
  createEvent(eventInterface: 'AnimationEvent'): AnimationEvent;
  createEvent(eventInterface: 'AnimationPlaybackEvent'): AnimationPlaybackEvent;
  createEvent(eventInterface: 'AudioProcessingEvent'): AudioProcessingEvent;
  createEvent(eventInterface: 'BeforeUnloadEvent'): BeforeUnloadEvent;
  createEvent(eventInterface: 'BlobEvent'): BlobEvent;
  createEvent(eventInterface: 'ClipboardEvent'): ClipboardEvent;
  createEvent(eventInterface: 'CloseEvent'): CloseEvent;
  createEvent(eventInterface: 'CompositionEvent'): CompositionEvent;
  createEvent(eventInterface: 'CustomEvent'): CustomEvent;
  createEvent(eventInterface: 'DeviceMotionEvent'): DeviceMotionEvent;
  createEvent(eventInterface: 'DeviceOrientationEvent'): DeviceOrientationEvent;
  createEvent(eventInterface: 'DragEvent'): DragEvent;
  createEvent(eventInterface: 'ErrorEvent'): ErrorEvent;
  createEvent(eventInterface: 'Event'): Event;
  createEvent(eventInterface: 'Events'): Event;
  createEvent(eventInterface: 'FocusEvent'): FocusEvent;
  createEvent(eventInterface: 'FontFaceSetLoadEvent'): FontFaceSetLoadEvent;
  createEvent(eventInterface: 'FormDataEvent'): FormDataEvent;
  createEvent(eventInterface: 'GamepadEvent'): GamepadEvent;
  createEvent(eventInterface: 'HashChangeEvent'): HashChangeEvent;
  createEvent(eventInterface: 'IDBVersionChangeEvent'): IDBVersionChangeEvent;
  createEvent(eventInterface: 'InputEvent'): InputEvent;
  createEvent(eventInterface: 'KeyboardEvent'): KeyboardEvent;
  createEvent(eventInterface: 'MIDIConnectionEvent'): MIDIConnectionEvent;
  createEvent(eventInterface: 'MIDIMessageEvent'): MIDIMessageEvent;
  createEvent(eventInterface: 'MediaEncryptedEvent'): MediaEncryptedEvent;
  createEvent(eventInterface: 'MediaKeyMessageEvent'): MediaKeyMessageEvent;
  createEvent(eventInterface: 'MediaQueryListEvent'): MediaQueryListEvent;
  createEvent(
    eventInterface: 'MediaRecorderErrorEvent'
  ): MediaRecorderErrorEvent;
  createEvent(eventInterface: 'MediaStreamTrackEvent'): MediaStreamTrackEvent;
  createEvent(eventInterface: 'MessageEvent'): MessageEvent;
  createEvent(eventInterface: 'MouseEvent'): MouseEvent;
  createEvent(eventInterface: 'MouseEvents'): MouseEvent;
  createEvent(eventInterface: 'MutationEvent'): MutationEvent;
  createEvent(eventInterface: 'MutationEvents'): MutationEvent;
  createEvent(
    eventInterface: 'OfflineAudioCompletionEvent'
  ): OfflineAudioCompletionEvent;
  createEvent(eventInterface: 'PageTransitionEvent'): PageTransitionEvent;
  createEvent(
    eventInterface: 'PaymentMethodChangeEvent'
  ): PaymentMethodChangeEvent;
  createEvent(
    eventInterface: 'PaymentRequestUpdateEvent'
  ): PaymentRequestUpdateEvent;
  createEvent(eventInterface: 'PointerEvent'): PointerEvent;
  createEvent(eventInterface: 'PopStateEvent'): PopStateEvent;
  createEvent(eventInterface: 'ProgressEvent'): ProgressEvent;
  createEvent(eventInterface: 'PromiseRejectionEvent'): PromiseRejectionEvent;
  createEvent(eventInterface: 'RTCDTMFToneChangeEvent'): RTCDTMFToneChangeEvent;
  createEvent(eventInterface: 'RTCDataChannelEvent'): RTCDataChannelEvent;
  createEvent(eventInterface: 'RTCErrorEvent'): RTCErrorEvent;
  createEvent(
    eventInterface: 'RTCPeerConnectionIceErrorEvent'
  ): RTCPeerConnectionIceErrorEvent;
  createEvent(
    eventInterface: 'RTCPeerConnectionIceEvent'
  ): RTCPeerConnectionIceEvent;
  createEvent(eventInterface: 'RTCTrackEvent'): RTCTrackEvent;
  createEvent(
    eventInterface: 'SecurityPolicyViolationEvent'
  ): SecurityPolicyViolationEvent;
  createEvent(
    eventInterface: 'SpeechSynthesisErrorEvent'
  ): SpeechSynthesisErrorEvent;
  createEvent(eventInterface: 'SpeechSynthesisEvent'): SpeechSynthesisEvent;
  createEvent(eventInterface: 'StorageEvent'): StorageEvent;
  createEvent(eventInterface: 'SubmitEvent'): SubmitEvent;
  createEvent(eventInterface: 'TouchEvent'): TouchEvent;
  createEvent(eventInterface: 'TrackEvent'): TrackEvent;
  createEvent(eventInterface: 'TransitionEvent'): TransitionEvent;
  createEvent(eventInterface: 'UIEvent'): UIEvent;
  createEvent(eventInterface: 'UIEvents'): UIEvent;
  createEvent(eventInterface: 'WebGLContextEvent'): WebGLContextEvent;
  createEvent(eventInterface: 'WheelEvent'): WheelEvent;
  createEvent(eventInterface: string): Event;
  /**
   * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
   * @param root The root element or node to start traversing on.
   * @param whatToShow The type of nodes or elements to appear in the node list
   * @param filter A custom NodeFilter function to use. For more information, see filter. Use null for no filter.
   */
  createNodeIterator(
    root: Node,
    whatToShow?: number,
    filter?: NodeFilter | null
  ): NodeIterator;
  /** Returns a ProcessingInstruction node whose target is target and data is data. If target does not match the Name production an "InvalidCharacterError" DOMException will be thrown. If data contains "?>" an "InvalidCharacterError" DOMException will be thrown. */
  createProcessingInstruction(
    target: string,
    data: string
  ): ProcessingInstruction;
  /**  Returns an empty range object that has both of its boundary points positioned at the beginning of the document. */
  createRange(): Range;
  /**
   * Creates a text string from the specified value.
   * @param data String that specifies the nodeValue property of the text node.
   */
  createTextNode(data: string): Text;
  /**
   * Creates a TreeWalker object that you can use to traverse filtered lists of nodes or elements in a document.
   * @param root The root element or node to start traversing on.
   * @param whatToShow The type of nodes or elements to appear in the node list. For more information, see whatToShow.
   * @param filter A custom NodeFilter function to use.
   */
  createTreeWalker(
    root: Node,
    whatToShow?: number,
    filter?: NodeFilter | null
  ): TreeWalker;
  /**
   * Executes a command on the current document, current selection, or the given range.
   * @param commandId String that specifies the command to execute. This command can be any of the command identifiers that can be executed in script.
   * @param showUI Display the user interface, defaults to false.
   * @param value Value to assign.
   * @deprecated
   */
  execCommand(commandId: string, showUI?: boolean, value?: string): boolean;
  /** Stops document's fullscreen element from being displayed fullscreen and resolves promise when done. */
  exitFullscreen(): Promise<void>;
  exitPictureInPicture(): Promise<void>;
  exitPointerLock(): void;
  /**
   * Returns a reference to the first object with the specified value of the ID attribute.
   * @param elementId String that specifies the ID value.
   */
  getElementById(elementId: string): HTMLElement | null;
  /** Returns a HTMLCollection of the elements in the object on which the method was invoked (a document or an element) that have all the classes given by classNames. The classNames argument is interpreted as a space-separated list of classes. */
  getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
  /**
   * Gets a collection of objects based on the value of the NAME or ID attribute.
   * @param elementName Gets a collection of objects based on the value of the NAME or ID attribute.
   */
  getElementsByName(elementName: string): NodeListOf<HTMLElement>;
  /**
   * Retrieves a collection of objects based on the specified element name.
   * @param name Specifies the name of an element.
   */
  getElementsByTagName<K extends keyof HTMLElementTagNameMap>(
    qualifiedName: K
  ): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
  getElementsByTagName<K extends keyof SVGElementTagNameMap>(
    qualifiedName: K
  ): HTMLCollectionOf<SVGElementTagNameMap[K]>;
  getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element>;
  /**
   * If namespace and localName are "*" returns a HTMLCollection of all descendant elements.
   *
   * If only namespace is "*" returns a HTMLCollection of all descendant elements whose local name is localName.
   *
   * If only localName is "*" returns a HTMLCollection of all descendant elements whose namespace is namespace.
   *
   * Otherwise, returns a HTMLCollection of all descendant elements whose namespace is namespace and local name is localName.
   */
  getElementsByTagNameNS(
    namespaceURI: 'http://www.w3.org/1999/xhtml',
    localName: string
  ): HTMLCollectionOf<HTMLElement>;
  getElementsByTagNameNS(
    namespaceURI: 'http://www.w3.org/2000/svg',
    localName: string
  ): HTMLCollectionOf<SVGElement>;
  getElementsByTagNameNS(
    namespace: string | null,
    localName: string
  ): HTMLCollectionOf<Element>;
  /** Returns an object representing the current selection of the document that is loaded into the object displaying a webpage. */
  getSelection(): Selection | null;
  /** Gets a value indicating whether the object currently has focus. */
  hasFocus(): boolean;
  hasStorageAccess(): Promise<boolean>;
  /**
   * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
   *
   * If node is a document or a shadow root, throws a "NotSupportedError" DOMException.
   */
  importNode<T extends Node>(node: T, deep?: boolean): T;
  /**
   * Opens a new window and loads a document specified by a given URL. Also, opens a new window that uses the url parameter and the name parameter to collect the output of the write method and the writeln method.
   * @param url Specifies a MIME type for the document.
   * @param name Specifies the name of the window. This name is used as the value for the TARGET attribute on a form or an anchor element.
   * @param features Contains a list of items separated by commas. Each item consists of an option and a value, separated by an equals sign (for example, "fullscreen=yes, toolbar=yes"). The following values are supported.
   * @param replace Specifies whether the existing entry for the document is replaced in the history list.
   */
  open(unused1?: string, unused2?: string): Document;
  open(url: string | URL, name: string, features: string): WindowProxy | null;
  /**
   * Returns a Boolean value that indicates whether a specified command can be successfully executed using execCommand, given the current state of the document.
   * @param commandId Specifies a command identifier.
   * @deprecated
   */
  queryCommandEnabled(commandId: string): boolean;
  /**
   * Returns a Boolean value that indicates whether the specified command is in the indeterminate state.
   * @param commandId String that specifies a command identifier.
   */
  queryCommandIndeterm(commandId: string): boolean;
  /**
   * Returns a Boolean value that indicates the current state of the command.
   * @param commandId String that specifies a command identifier.
   * @deprecated
   */
  queryCommandState(commandId: string): boolean;
  /**
   * Returns a Boolean value that indicates whether the current command is supported on the current range.
   * @param commandId Specifies a command identifier.
   * @deprecated
   */
  queryCommandSupported(commandId: string): boolean;
  /**
   * Returns the current value of the document, range, or current selection for the given command.
   * @param commandId String that specifies a command identifier.
   */
  queryCommandValue(commandId: string): string;
  /** @deprecated */
  releaseEvents(): void;
  requestStorageAccess(): Promise<void>;
  /**
   * Writes one or more HTML expressions to a document in the specified window.
   * @param content Specifies the text and HTML tags to write.
   */
  write(...text: readonly string[]): void;
  /**
   * Writes one or more HTML expressions, followed by a carriage return, to a document in the specified window.
   * @param content The text and HTML tags to write.
   */
  writeln(...text: readonly string[]): void;
  addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const Document: {
  readonly prototype: Document;
  new (): Document;
};

interface DocumentAndElementEventHandlersEventMap {
  readonly copy: ClipboardEvent;
  readonly cut: ClipboardEvent;
  readonly paste: ClipboardEvent;
}

interface DocumentAndElementEventHandlers {
  readonly oncopy:
    | ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => unknown)
    | null;
  readonly oncut:
    | ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => unknown)
    | null;
  readonly onpaste:
    | ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => unknown)
    | null;
  addEventListener<K extends keyof DocumentAndElementEventHandlersEventMap>(
    type: K,
    listener: (
      this: DocumentAndElementEventHandlers,
      ev: DocumentAndElementEventHandlersEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof DocumentAndElementEventHandlersEventMap>(
    type: K,
    listener: (
      this: DocumentAndElementEventHandlers,
      ev: DocumentAndElementEventHandlersEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** A minimal document object that has no parent. It is used as a lightweight version of Document that stores a segment of a document structure comprised of nodes just like a standard document. The key difference is that because the document fragment isn't part of the active document tree structure, changes made to the fragment don't affect the document, cause reflow, or incur any performance impact that can occur when changes are made. */
interface DocumentFragment extends Node, NonElementParentNode, ParentNode {
  readonly ownerDocument: Document;
  getElementById(elementId: string): HTMLElement | null;
}

declare const DocumentFragment: {
  readonly prototype: DocumentFragment;
  new (): DocumentFragment;
};

interface DocumentOrShadowRoot {
  /**
   * Returns the deepest element in the document through which or to which key events are being routed. This is, roughly speaking, the focused element in the document.
   *
   * For the purposes of this API, when a child browsing context is focused, its container is focused in the parent browsing context. For example, if the user moves the focus to a text control in an iframe, the iframe is the element returned by the activeElement API in the iframe's node document.
   *
   * Similarly, when the focused element is in a different node tree than documentOrShadowRoot, the element returned will be the host that's located in the same node tree as documentOrShadowRoot if documentOrShadowRoot is a shadow-including inclusive ancestor of the focused element, and null if not.
   */
  readonly activeElement: Element | null;
  /** Returns document's fullscreen element. */
  readonly fullscreenElement: Element | null;
  readonly pictureInPictureElement: Element | null;
  readonly pointerLockElement: Element | null;
  /** Retrieves a collection of styleSheet objects representing the style sheets that correspond to each instance of a link or style object in the document. */
  readonly styleSheets: StyleSheetList;
  /**
   * Returns the element for the specified x coordinate and the specified y coordinate.
   * @param x The x-offset
   * @param y The y-offset
   */
  elementFromPoint(x: number, y: number): Element | null;
  elementsFromPoint(x: number, y: number): readonly Element[];
  getAnimations(): readonly Animation[];
}

interface DocumentTimeline extends AnimationTimeline {}

declare const DocumentTimeline: {
  readonly prototype: DocumentTimeline;
  new (options?: DocumentTimelineOptions): DocumentTimeline;
};

/** A Node containing a doctype. */
interface DocumentType extends Node, ChildNode {
  readonly name: string;
  readonly ownerDocument: Document;
  readonly publicId: string;
  readonly systemId: string;
}

declare const DocumentType: {
  readonly prototype: DocumentType;
  new (): DocumentType;
};

/** A DOM event that represents a drag and drop interaction. The user initiates a drag by placing a pointer device (such as a mouse) on the touch surface and then dragging the pointer to a new location (such as another DOM element). Applications are free to interpret a drag and drop interaction in an application-specific way. */
interface DragEvent extends MouseEvent {
  /** Returns the DataTransfer object for the event. */
  readonly dataTransfer: DataTransfer | null;
}

declare const DragEvent: {
  readonly prototype: DragEvent;
  new (type: string, eventInitDict?: DragEventInit): DragEvent;
};

/** Inherits properties from its parent, AudioNode. */
interface DynamicsCompressorNode extends AudioNode {
  readonly attack: AudioParam;
  readonly knee: AudioParam;
  readonly ratio: AudioParam;
  readonly reduction: number;
  readonly release: AudioParam;
  readonly threshold: AudioParam;
}

declare const DynamicsCompressorNode: {
  readonly prototype: DynamicsCompressorNode;
  new (
    context: BaseAudioContext,
    options?: DynamicsCompressorOptions
  ): DynamicsCompressorNode;
};

interface EXT_blend_minmax {
  readonly MAX_EXT: GLenum;
  readonly MIN_EXT: GLenum;
}

interface EXT_color_buffer_float {}

interface EXT_color_buffer_half_float {
  readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: GLenum;
  readonly RGB16F_EXT: GLenum;
  readonly RGBA16F_EXT: GLenum;
  readonly UNSIGNED_NORMALIZED_EXT: GLenum;
}

interface EXT_float_blend {}

/** The EXT_frag_depth extension is part of the WebGL API and enables to set a depth value of a fragment from within the fragment shader. */
interface EXT_frag_depth {}

interface EXT_sRGB {
  readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT: GLenum;
  readonly SRGB8_ALPHA8_EXT: GLenum;
  readonly SRGB_ALPHA_EXT: GLenum;
  readonly SRGB_EXT: GLenum;
}

interface EXT_shader_texture_lod {}

interface EXT_texture_compression_rgtc {
  readonly COMPRESSED_RED_GREEN_RGTC2_EXT: GLenum;
  readonly COMPRESSED_RED_RGTC1_EXT: GLenum;
  readonly COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: GLenum;
  readonly COMPRESSED_SIGNED_RED_RGTC1_EXT: GLenum;
}

/** The EXT_texture_filter_anisotropic extension is part of the WebGL API and exposes two constants for anisotropic filtering (AF). */
interface EXT_texture_filter_anisotropic {
  readonly MAX_TEXTURE_MAX_ANISOTROPY_EXT: GLenum;
  readonly TEXTURE_MAX_ANISOTROPY_EXT: GLenum;
}

interface ElementEventMap {
  readonly fullscreenchange: Event;
  readonly fullscreenerror: Event;
}

/** Element is the most general base class from which all objects in a Document inherit. It only has methods and properties common to all kinds of elements. More specific classes inherit from Element. */
interface Element
  extends Node,
    ARIAMixin,
    Animatable,
    ChildNode,
    InnerHTML,
    NonDocumentTypeChildNode,
    ParentNode,
    Slottable {
  readonly attributes: NamedNodeMap;
  /** Allows for manipulation of element's class content attribute as a set of whitespace-separated tokens through a DOMTokenList object. */
  readonly classList: DOMTokenList;
  /** Returns the value of element's class content attribute. Can be set to change it. */
  readonly className: string;
  readonly clientHeight: number;
  readonly clientLeft: number;
  readonly clientTop: number;
  readonly clientWidth: number;
  /** Returns the value of element's id content attribute. Can be set to change it. */
  readonly id: string;
  /** Returns the local name. */
  readonly localName: string;
  /** Returns the namespace. */
  readonly namespaceURI: string | null;
  readonly onfullscreenchange: ((this: Element, ev: Event) => unknown) | null;
  readonly onfullscreenerror: ((this: Element, ev: Event) => unknown) | null;
  readonly outerHTML: string;
  readonly ownerDocument: Document;
  readonly part: DOMTokenList;
  /** Returns the namespace prefix. */
  readonly prefix: string | null;
  readonly scrollHeight: number;
  readonly scrollLeft: number;
  readonly scrollTop: number;
  readonly scrollWidth: number;
  /** Returns element's shadow root, if any, and if shadow root's mode is "open", and null otherwise. */
  readonly shadowRoot: ShadowRoot | null;
  /** Returns the value of element's slot content attribute. Can be set to change it. */
  readonly slot: string;
  /** Returns the HTML-uppercased qualified name. */
  readonly tagName: string;
  /** Creates a shadow root for element and returns it. */
  attachShadow(init: ShadowRootInit): ShadowRoot;
  /** Returns the first (starting at element) inclusive ancestor that matches selectors, and null otherwise. */
  closest<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): HTMLElementTagNameMap[K] | null;
  closest<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): SVGElementTagNameMap[K] | null;
  closest<E extends Element = Element>(selectors: string): E | null;
  /** Returns element's first attribute whose qualified name is qualifiedName, and null if there is no such attribute otherwise. */
  getAttribute(qualifiedName: string): string | null;
  /** Returns element's attribute whose namespace is namespace and local name is localName, and null if there is no such attribute otherwise. */
  getAttributeNS(namespace: string | null, localName: string): string | null;
  /** Returns the qualified names of all element's attributes. Can contain duplicates. */
  getAttributeNames(): readonly string[];
  getAttributeNode(qualifiedName: string): Attr | null;
  getAttributeNodeNS(namespace: string | null, localName: string): Attr | null;
  getBoundingClientRect(): DOMRect;
  getClientRects(): DOMRectList;
  /** Returns a HTMLCollection of the elements in the object on which the method was invoked (a document or an element) that have all the classes given by classNames. The classNames argument is interpreted as a space-separated list of classes. */
  getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
  getElementsByTagName<K extends keyof HTMLElementTagNameMap>(
    qualifiedName: K
  ): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
  getElementsByTagName<K extends keyof SVGElementTagNameMap>(
    qualifiedName: K
  ): HTMLCollectionOf<SVGElementTagNameMap[K]>;
  getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element>;
  getElementsByTagNameNS(
    namespaceURI: 'http://www.w3.org/1999/xhtml',
    localName: string
  ): HTMLCollectionOf<HTMLElement>;
  getElementsByTagNameNS(
    namespaceURI: 'http://www.w3.org/2000/svg',
    localName: string
  ): HTMLCollectionOf<SVGElement>;
  getElementsByTagNameNS(
    namespace: string | null,
    localName: string
  ): HTMLCollectionOf<Element>;
  /** Returns true if element has an attribute whose qualified name is qualifiedName, and false otherwise. */
  hasAttribute(qualifiedName: string): boolean;
  /** Returns true if element has an attribute whose namespace is namespace and local name is localName. */
  hasAttributeNS(namespace: string | null, localName: string): boolean;
  /** Returns true if element has attributes, and false otherwise. */
  hasAttributes(): boolean;
  hasPointerCapture(pointerId: number): boolean;
  insertAdjacentElement(
    where: InsertPosition,
    element: Element
  ): Element | null;
  insertAdjacentHTML(position: InsertPosition, text: string): void;
  insertAdjacentText(where: InsertPosition, data: string): void;
  /** Returns true if matching selectors against element's root yields element, and false otherwise. */
  matches(selectors: string): boolean;
  releasePointerCapture(pointerId: number): void;
  /** Removes element's first attribute whose qualified name is qualifiedName. */
  removeAttribute(qualifiedName: string): void;
  /** Removes element's attribute whose namespace is namespace and local name is localName. */
  removeAttributeNS(namespace: string | null, localName: string): void;
  removeAttributeNode(attr: Attr): Attr;
  /**
   * Displays element fullscreen and resolves promise when done.
   *
   * When supplied, options's navigationUI member indicates whether showing navigation UI while in fullscreen is preferred or not. If set to "show", navigation simplicity is preferred over screen space, and if set to "hide", more screen space is preferred. User agents are always free to honor user preference over the application's. The default value "auto" indicates no application preference.
   */
  requestFullscreen(options?: FullscreenOptions): Promise<void>;
  requestPointerLock(): void;
  scroll(options?: ScrollToOptions): void;
  scroll(x: number, y: number): void;
  scrollBy(options?: ScrollToOptions): void;
  scrollBy(x: number, y: number): void;
  scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;
  scrollTo(options?: ScrollToOptions): void;
  scrollTo(x: number, y: number): void;
  /** Sets the value of element's first attribute whose qualified name is qualifiedName to value. */
  setAttribute(qualifiedName: string, value: string): void;
  /** Sets the value of element's attribute whose namespace is namespace and local name is localName to value. */
  setAttributeNS(
    namespace: string | null,
    qualifiedName: string,
    value: string
  ): void;
  setAttributeNode(attr: Attr): Attr | null;
  setAttributeNodeNS(attr: Attr): Attr | null;
  setPointerCapture(pointerId: number): void;
  /**
   * If force is not given, "toggles" qualifiedName, removing it if it is present and adding it if it is not present. If force is true, adds qualifiedName. If force is false, removes qualifiedName.
   *
   * Returns true if qualifiedName is now present, and false otherwise.
   */
  toggleAttribute(qualifiedName: string, force?: boolean): boolean;
  /** @deprecated This is a legacy alias of `matches`. */
  webkitMatchesSelector(selectors: string): boolean;
  addEventListener<K extends keyof ElementEventMap>(
    type: K,
    listener: (this: Element, ev: ElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ElementEventMap>(
    type: K,
    listener: (this: Element, ev: ElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const Element: {
  readonly prototype: Element;
  new (): Element;
};

interface ElementCSSInlineStyle {
  readonly style: CSSStyleDeclaration;
}

interface ElementContentEditable {
  readonly contentEditable: string;
  readonly enterKeyHint: string;
  readonly inputMode: string;
  readonly isContentEditable: boolean;
}

interface ElementInternals extends ARIAMixin {
  /** Returns the form owner of internals's target element. */
  readonly form: HTMLFormElement | null;
  /** Returns a NodeList of all the label elements that internals's target element is associated with. */
  readonly labels: NodeList;
  /** Returns the ShadowRoot for internals's target element, if the target element is a shadow host, or null otherwise. */
  readonly shadowRoot: ShadowRoot | null;
  /** Returns true if internals's target element will be validated when the form is submitted; false otherwise. */
  readonly willValidate: boolean;
  /**
   * Sets both the state and submission value of internals's target element to value.
   *
   * If value is null, the element won't participate in form submission.
   */
  setFormValue(
    value: File | string | FormData | null,
    state?: File | string | FormData | null
  ): void;
}

declare const ElementInternals: {
  readonly prototype: ElementInternals;
  new (): ElementInternals;
};

/** Events providing information related to errors in scripts or in files. */
interface ErrorEvent extends Event {
  readonly colno: number;
  readonly error: unknown;
  readonly filename: string;
  readonly lineno: number;
  readonly message: string;
}

declare const ErrorEvent: {
  readonly prototype: ErrorEvent;
  new (type: string, eventInitDict?: ErrorEventInit): ErrorEvent;
};

/** An event which takes place in the DOM. */
interface Event {
  /** Returns true or false depending on how event was initialized. True if event goes through its target's ancestors in reverse tree order, and false otherwise. */
  readonly bubbles: boolean;
  readonly cancelBubble: boolean;
  /** Returns true or false depending on how event was initialized. Its return value does not always carry meaning, but true can indicate that part of the operation during which event was dispatched, can be canceled by invoking the preventDefault() method. */
  readonly cancelable: boolean;
  /** Returns true or false depending on how event was initialized. True if event invokes listeners past a ShadowRoot node that is the root of its target, and false otherwise. */
  readonly composed: boolean;
  /** Returns the object whose event listener's callback is currently being invoked. */
  readonly currentTarget: EventTarget | null;
  /** Returns true if preventDefault() was invoked successfully to indicate cancelation, and false otherwise. */
  readonly defaultPrevented: boolean;
  /** Returns the event's phase, which is one of NONE, CAPTURING_PHASE, AT_TARGET, and BUBBLING_PHASE. */
  readonly eventPhase: number;
  /** Returns true if event was dispatched by the user agent, and false otherwise. */
  readonly isTrusted: boolean;
  /** @deprecated */
  readonly returnValue: boolean;
  /** @deprecated */
  readonly srcElement: EventTarget | null;
  /** Returns the object to which event is dispatched (its target). */
  readonly target: EventTarget | null;
  /** Returns the event's timestamp as the number of milliseconds measured relative to the time origin. */
  readonly timeStamp: DOMHighResTimeStamp;
  /** Returns the type of event, e.g. "click", "hashchange", or "submit". */
  readonly type: string;
  /** Returns the invocation target objects of event's path (objects on which listeners will be invoked), except for any nodes in shadow trees of which the shadow root's mode is "closed" that are not reachable from event's currentTarget. */
  composedPath(): readonly EventTarget[];
  /** @deprecated */
  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
  /** If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled. */
  preventDefault(): void;
  /** Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects. */
  stopImmediatePropagation(): void;
  /** When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object. */
  stopPropagation(): void;
  readonly AT_TARGET: number;
  readonly BUBBLING_PHASE: number;
  readonly CAPTURING_PHASE: number;
  readonly NONE: number;
}

declare const Event: {
  readonly prototype: Event;
  new (type: string, eventInitDict?: EventInit): Event;
  readonly AT_TARGET: number;
  readonly BUBBLING_PHASE: number;
  readonly CAPTURING_PHASE: number;
  readonly NONE: number;
};

interface EventCounts {
  forEach(
    callbackfn: (value: number, key: string, parent: EventCounts) => void,
    thisArg?: unknown
  ): void;
}

declare const EventCounts: {
  readonly prototype: EventCounts;
  new (): EventCounts;
};

interface EventListener {
  (evt: Event): void;
}

interface EventListenerObject {
  handleEvent(object: Event): void;
}

interface EventSourceEventMap {
  readonly error: Event;
  readonly message: MessageEvent;
  readonly open: Event;
}

interface EventSource extends EventTarget {
  readonly onerror: ((this: EventSource, ev: Event) => unknown) | null;
  readonly onmessage: ((this: EventSource, ev: MessageEvent) => unknown) | null;
  readonly onopen: ((this: EventSource, ev: Event) => unknown) | null;
  /** Returns the state of this EventSource object's connection. It can have the values described below. */
  readonly readyState: number;
  /** Returns the URL providing the event stream. */
  readonly url: string;
  /** Returns true if the credentials mode for connection requests to the URL providing the event stream is set to "include", and false otherwise. */
  readonly withCredentials: boolean;
  /** Aborts any instances of the fetch algorithm started for this EventSource object, and sets the readyState attribute to CLOSED. */
  close(): void;
  readonly CLOSED: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
  addEventListener<K extends keyof EventSourceEventMap>(
    type: K,
    listener: (this: EventSource, ev: EventSourceEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: (this: EventSource, event: MessageEvent) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof EventSourceEventMap>(
    type: K,
    listener: (this: EventSource, ev: EventSourceEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: (this: EventSource, event: MessageEvent) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const EventSource: {
  readonly prototype: EventSource;
  new (url: string | URL, eventSourceInitDict?: EventSourceInit): EventSource;
  readonly CLOSED: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
};

/** EventTarget is a DOM interface implemented by objects that can receive events and may have listeners for them. */
interface EventTarget {
  /**
   * Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.
   *
   * The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.
   *
   * When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.
   *
   * When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.
   *
   * When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.
   *
   * If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.
   *
   * The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.
   */
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean
  ): void;
  /** Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise. */
  dispatchEvent(event: Event): boolean;
  /** Removes the event listener in target's event listener list with the same type, callback, and options. */
  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void;
}

declare const EventTarget: {
  readonly prototype: EventTarget;
  new (): EventTarget;
};

/** @deprecated */
interface External {
  /** @deprecated */
  AddSearchProvider(): void;
  /** @deprecated */
  IsSearchProviderInstalled(): void;
}

/** @deprecated */
declare const External: {
  readonly prototype: External;
  new (): External;
};

/** Provides information about files and allows JavaScript in a web page to access their content. */
interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
  readonly webkitRelativePath: string;
}

declare const File: {
  readonly prototype: File;
  new (
    fileBits: readonly BlobPart[],
    fileName: string,
    options?: FilePropertyBag
  ): File;
};

/** An object of this type is returned by the files property of the HTML <input> element; this lets you access the list of files selected with the <input type="file"> element. It's also used for a list of files dropped into web content when using the drag and drop API; see the DataTransfer object for details on this usage. */
interface FileList {
  readonly length: number;
  item(index: number): File | null;
  readonly [index: number]: File;
}

declare const FileList: {
  readonly prototype: FileList;
  new (): FileList;
};

interface FileReaderEventMap {
  readonly abort: ProgressEvent<FileReader>;
  readonly error: ProgressEvent<FileReader>;
  readonly load: ProgressEvent<FileReader>;
  readonly loadend: ProgressEvent<FileReader>;
  readonly loadstart: ProgressEvent<FileReader>;
  readonly progress: ProgressEvent<FileReader>;
}

/** Lets web applications asynchronously read the contents of files (or raw data buffers) stored on the user's computer, using File or Blob objects to specify the file or data to read. */
interface FileReader extends EventTarget {
  readonly error: DOMException | null;
  readonly onabort:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null;
  readonly onerror:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null;
  readonly onload:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null;
  readonly onloadend:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null;
  readonly onloadstart:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null;
  readonly onprogress:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null;
  readonly readyState: number;
  readonly result: string | ArrayBuffer | null;
  abort(): void;
  readAsArrayBuffer(blob: Blob): void;
  readAsBinaryString(blob: Blob): void;
  readAsDataURL(blob: Blob): void;
  readAsText(blob: Blob, encoding?: string): void;
  readonly DONE: number;
  readonly EMPTY: number;
  readonly LOADING: number;
  addEventListener<K extends keyof FileReaderEventMap>(
    type: K,
    listener: (this: FileReader, ev: FileReaderEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof FileReaderEventMap>(
    type: K,
    listener: (this: FileReader, ev: FileReaderEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const FileReader: {
  readonly prototype: FileReader;
  new (): FileReader;
  readonly DONE: number;
  readonly EMPTY: number;
  readonly LOADING: number;
};

interface FileSystem {
  readonly name: string;
  readonly root: FileSystemDirectoryEntry;
}

declare const FileSystem: {
  readonly prototype: FileSystem;
  new (): FileSystem;
};

interface FileSystemDirectoryEntry extends FileSystemEntry {
  createReader(): FileSystemDirectoryReader;
  getDirectory(
    path?: string | null,
    options?: FileSystemFlags,
    successCallback?: FileSystemEntryCallback,
    errorCallback?: ErrorCallback
  ): void;
  getFile(
    path?: string | null,
    options?: FileSystemFlags,
    successCallback?: FileSystemEntryCallback,
    errorCallback?: ErrorCallback
  ): void;
}

declare const FileSystemDirectoryEntry: {
  readonly prototype: FileSystemDirectoryEntry;
  new (): FileSystemDirectoryEntry;
};

/** Available only in secure contexts. */
interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: 'directory';
  getDirectoryHandle(
    name: string,
    options?: FileSystemGetDirectoryOptions
  ): Promise<FileSystemDirectoryHandle>;
  getFileHandle(
    name: string,
    options?: FileSystemGetFileOptions
  ): Promise<FileSystemFileHandle>;
  removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
  resolve(
    possibleDescendant: FileSystemHandle
  ): Promise<readonly string[] | null>;
}

declare const FileSystemDirectoryHandle: {
  readonly prototype: FileSystemDirectoryHandle;
  new (): FileSystemDirectoryHandle;
};

interface FileSystemDirectoryReader {
  readEntries(
    successCallback: FileSystemEntriesCallback,
    errorCallback?: ErrorCallback
  ): void;
}

declare const FileSystemDirectoryReader: {
  readonly prototype: FileSystemDirectoryReader;
  new (): FileSystemDirectoryReader;
};

interface FileSystemEntry {
  readonly filesystem: FileSystem;
  readonly fullPath: string;
  readonly isDirectory: boolean;
  readonly isFile: boolean;
  readonly name: string;
  getParent(
    successCallback?: FileSystemEntryCallback,
    errorCallback?: ErrorCallback
  ): void;
}

declare const FileSystemEntry: {
  readonly prototype: FileSystemEntry;
  new (): FileSystemEntry;
};

interface FileSystemFileEntry extends FileSystemEntry {
  file(successCallback: FileCallback, errorCallback?: ErrorCallback): void;
}

declare const FileSystemFileEntry: {
  readonly prototype: FileSystemFileEntry;
  new (): FileSystemFileEntry;
};

/** Available only in secure contexts. */
interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file';
  getFile(): Promise<File>;
}

declare const FileSystemFileHandle: {
  readonly prototype: FileSystemFileHandle;
  new (): FileSystemFileHandle;
};

/** Available only in secure contexts. */
interface FileSystemHandle {
  readonly kind: FileSystemHandleKind;
  readonly name: string;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

declare const FileSystemHandle: {
  readonly prototype: FileSystemHandle;
  new (): FileSystemHandle;
};

/** Focus-related events like focus, blur, focusin, or focusout. */
interface FocusEvent extends UIEvent {
  readonly relatedTarget: EventTarget | null;
}

declare const FocusEvent: {
  readonly prototype: FocusEvent;
  new (type: string, eventInitDict?: FocusEventInit): FocusEvent;
};

interface FontFace {
  readonly ascentOverride: string;
  readonly descentOverride: string;
  readonly display: string;
  readonly family: string;
  readonly featureSettings: string;
  readonly lineGapOverride: string;
  readonly loaded: Promise<FontFace>;
  readonly status: FontFaceLoadStatus;
  readonly stretch: string;
  readonly style: string;
  readonly unicodeRange: string;
  readonly variant: string;
  readonly variationSettings: string;
  readonly weight: string;
  load(): Promise<FontFace>;
}

declare const FontFace: {
  readonly prototype: FontFace;
  new (
    family: string,
    source: string | BinaryData,
    descriptors?: FontFaceDescriptors
  ): FontFace;
};

interface FontFaceSetEventMap {
  readonly loading: Event;
  readonly loadingdone: Event;
  readonly loadingerror: Event;
}

interface FontFaceSet extends EventTarget {
  readonly onloading: ((this: FontFaceSet, ev: Event) => unknown) | null;
  readonly onloadingdone: ((this: FontFaceSet, ev: Event) => unknown) | null;
  readonly onloadingerror: ((this: FontFaceSet, ev: Event) => unknown) | null;
  readonly ready: Promise<FontFaceSet>;
  readonly status: FontFaceSetLoadStatus;
  check(font: string, text?: string): boolean;
  load(font: string, text?: string): Promise<readonly FontFace[]>;
  forEach(
    callbackfn: (value: FontFace, key: FontFace, parent: FontFaceSet) => void,
    thisArg?: unknown
  ): void;
  addEventListener<K extends keyof FontFaceSetEventMap>(
    type: K,
    listener: (this: FontFaceSet, ev: FontFaceSetEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof FontFaceSetEventMap>(
    type: K,
    listener: (this: FontFaceSet, ev: FontFaceSetEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const FontFaceSet: {
  readonly prototype: FontFaceSet;
  new (initialFaces: readonly FontFace[]): FontFaceSet;
};

interface FontFaceSetLoadEvent extends Event {
  readonly fontfaces: ReadonlyArray<FontFace>;
}

declare const FontFaceSetLoadEvent: {
  readonly prototype: FontFaceSetLoadEvent;
  new (
    type: string,
    eventInitDict?: FontFaceSetLoadEventInit
  ): FontFaceSetLoadEvent;
};

interface FontFaceSource {
  readonly fonts: FontFaceSet;
}

/** Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data". */
interface FormData {
  append(name: string, value: string | Blob, fileName?: string): void;
  delete(name: string): void;
  get(name: string): FormDataEntryValue | null;
  getAll(name: string): readonly FormDataEntryValue[];
  has(name: string): boolean;
  set(name: string, value: string | Blob, fileName?: string): void;
  forEach(
    callbackfn: (
      value: FormDataEntryValue,
      key: string,
      parent: FormData
    ) => void,
    thisArg?: unknown
  ): void;
}

declare const FormData: {
  readonly prototype: FormData;
  new (form?: HTMLFormElement): FormData;
};

interface FormDataEvent extends Event {
  /** Returns a FormData object representing names and values of elements associated to the target form. Operations on the FormData object will affect form data to be submitted. */
  readonly formData: FormData;
}

declare const FormDataEvent: {
  readonly prototype: FormDataEvent;
  new (type: string, eventInitDict: FormDataEventInit): FormDataEvent;
};

/** A change in volume. It is an AudioNode audio-processing module that causes a given gain to be applied to the input data before its propagation to the output. A GainNode always has exactly one input and one output, both with the same number of channels. */
interface GainNode extends AudioNode {
  readonly gain: AudioParam;
}

declare const GainNode: {
  readonly prototype: GainNode;
  new (context: BaseAudioContext, options?: GainOptions): GainNode;
};

/**
 * This Gamepad API interface defines an individual gamepad or other controller, allowing access to information such as button presses, axis positions, and id.
 * Available only in secure contexts.
 */
interface Gamepad {
  readonly axes: ReadonlyArray<number>;
  readonly buttons: ReadonlyArray<GamepadButton>;
  readonly connected: boolean;
  readonly hapticActuators: ReadonlyArray<GamepadHapticActuator>;
  readonly id: string;
  readonly index: number;
  readonly mapping: GamepadMappingType;
  readonly timestamp: DOMHighResTimeStamp;
}

declare const Gamepad: {
  readonly prototype: Gamepad;
  new (): Gamepad;
};

/**
 * An individual button of a gamepad or other controller, allowing access to the current state of different types of buttons available on the control device.
 * Available only in secure contexts.
 */
interface GamepadButton {
  readonly pressed: boolean;
  readonly touched: boolean;
  readonly value: number;
}

declare const GamepadButton: {
  readonly prototype: GamepadButton;
  new (): GamepadButton;
};

/**
 * This Gamepad API interface contains references to gamepads connected to the system, which is what the gamepad events Window.gamepadconnected and Window.gamepaddisconnected are fired in response to.
 * Available only in secure contexts.
 */
interface GamepadEvent extends Event {
  readonly gamepad: Gamepad;
}

declare const GamepadEvent: {
  readonly prototype: GamepadEvent;
  new (type: string, eventInitDict: GamepadEventInit): GamepadEvent;
};

/** This Gamepad API interface represents hardware in the controller designed to provide haptic feedback to the user (if available), most commonly vibration hardware. */
interface GamepadHapticActuator {
  readonly type: GamepadHapticActuatorType;
}

declare const GamepadHapticActuator: {
  readonly prototype: GamepadHapticActuator;
  new (): GamepadHapticActuator;
};

interface GenericTransformStream {
  readonly readable: ReadableStream;
  readonly writable: WritableStream;
}

/** An object able to programmatically obtain the position of the device. It gives Web content access to the location of the device. This allows a Web site or app to offer customized results based on the user's location. */
interface Geolocation {
  clearWatch(watchId: number): void;
  getCurrentPosition(
    successCallback: PositionCallback,
    errorCallback?: PositionErrorCallback | null,
    options?: PositionOptions
  ): void;
  watchPosition(
    successCallback: PositionCallback,
    errorCallback?: PositionErrorCallback | null,
    options?: PositionOptions
  ): number;
}

declare const Geolocation: {
  readonly prototype: Geolocation;
  new (): Geolocation;
};

/** Available only in secure contexts. */
interface GeolocationCoordinates {
  readonly accuracy: number;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly speed: number | null;
}

declare const GeolocationCoordinates: {
  readonly prototype: GeolocationCoordinates;
  new (): GeolocationCoordinates;
};

/** Available only in secure contexts. */
interface GeolocationPosition {
  readonly coords: GeolocationCoordinates;
  readonly timestamp: EpochTimeStamp;
}

declare const GeolocationPosition: {
  readonly prototype: GeolocationPosition;
  new (): GeolocationPosition;
};

interface GeolocationPositionError {
  readonly code: number;
  readonly message: string;
  readonly PERMISSION_DENIED: number;
  readonly POSITION_UNAVAILABLE: number;
  readonly TIMEOUT: number;
}

declare const GeolocationPositionError: {
  readonly prototype: GeolocationPositionError;
  new (): GeolocationPositionError;
  readonly PERMISSION_DENIED: number;
  readonly POSITION_UNAVAILABLE: number;
  readonly TIMEOUT: number;
};

interface GlobalEventHandlersEventMap {
  readonly abort: UIEvent;
  readonly animationcancel: AnimationEvent;
  readonly animationend: AnimationEvent;
  readonly animationiteration: AnimationEvent;
  readonly animationstart: AnimationEvent;
  readonly auxclick: MouseEvent;
  readonly beforeinput: InputEvent;
  readonly blur: FocusEvent;
  readonly canplay: Event;
  readonly canplaythrough: Event;
  readonly change: Event;
  readonly click: MouseEvent;
  readonly close: Event;
  readonly compositionend: CompositionEvent;
  readonly compositionstart: CompositionEvent;
  readonly compositionupdate: CompositionEvent;
  readonly contextmenu: MouseEvent;
  readonly cuechange: Event;
  readonly dblclick: MouseEvent;
  readonly drag: DragEvent;
  readonly dragend: DragEvent;
  readonly dragenter: DragEvent;
  readonly dragleave: DragEvent;
  readonly dragover: DragEvent;
  readonly dragstart: DragEvent;
  readonly drop: DragEvent;
  readonly durationchange: Event;
  readonly emptied: Event;
  readonly ended: Event;
  readonly error: ErrorEvent;
  readonly focus: FocusEvent;
  readonly focusin: FocusEvent;
  readonly focusout: FocusEvent;
  readonly formdata: FormDataEvent;
  readonly gotpointercapture: PointerEvent;
  readonly input: Event;
  readonly invalid: Event;
  readonly keydown: KeyboardEvent;
  readonly keypress: KeyboardEvent;
  readonly keyup: KeyboardEvent;
  readonly load: Event;
  readonly loadeddata: Event;
  readonly loadedmetadata: Event;
  readonly loadstart: Event;
  readonly lostpointercapture: PointerEvent;
  readonly mousedown: MouseEvent;
  readonly mouseenter: MouseEvent;
  readonly mouseleave: MouseEvent;
  readonly mousemove: MouseEvent;
  readonly mouseout: MouseEvent;
  readonly mouseover: MouseEvent;
  readonly mouseup: MouseEvent;
  readonly pause: Event;
  readonly play: Event;
  readonly playing: Event;
  readonly pointercancel: PointerEvent;
  readonly pointerdown: PointerEvent;
  readonly pointerenter: PointerEvent;
  readonly pointerleave: PointerEvent;
  readonly pointermove: PointerEvent;
  readonly pointerout: PointerEvent;
  readonly pointerover: PointerEvent;
  readonly pointerup: PointerEvent;
  readonly progress: ProgressEvent;
  readonly ratechange: Event;
  readonly reset: Event;
  readonly resize: UIEvent;
  readonly scroll: Event;
  readonly securitypolicyviolation: SecurityPolicyViolationEvent;
  readonly seeked: Event;
  readonly seeking: Event;
  readonly select: Event;
  readonly selectionchange: Event;
  readonly selectstart: Event;
  readonly slotchange: Event;
  readonly stalled: Event;
  readonly submit: SubmitEvent;
  readonly suspend: Event;
  readonly timeupdate: Event;
  readonly toggle: Event;
  readonly touchcancel: TouchEvent;
  readonly touchend: TouchEvent;
  readonly touchmove: TouchEvent;
  readonly touchstart: TouchEvent;
  readonly transitioncancel: TransitionEvent;
  readonly transitionend: TransitionEvent;
  readonly transitionrun: TransitionEvent;
  readonly transitionstart: TransitionEvent;
  readonly volumechange: Event;
  readonly waiting: Event;
  readonly webkitanimationend: Event;
  readonly webkitanimationiteration: Event;
  readonly webkitanimationstart: Event;
  readonly webkittransitionend: Event;
  readonly wheel: WheelEvent;
}

interface GlobalEventHandlers {
  /**
   * Fires when the user aborts the download.
   * @param ev The event.
   */
  readonly onabort:
    | ((this: GlobalEventHandlers, ev: UIEvent) => unknown)
    | null;
  readonly onanimationcancel:
    | ((this: GlobalEventHandlers, ev: AnimationEvent) => unknown)
    | null;
  readonly onanimationend:
    | ((this: GlobalEventHandlers, ev: AnimationEvent) => unknown)
    | null;
  readonly onanimationiteration:
    | ((this: GlobalEventHandlers, ev: AnimationEvent) => unknown)
    | null;
  readonly onanimationstart:
    | ((this: GlobalEventHandlers, ev: AnimationEvent) => unknown)
    | null;
  readonly onauxclick:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  /**
   * Fires when the object loses the input focus.
   * @param ev The focus event.
   */
  readonly onblur:
    | ((this: GlobalEventHandlers, ev: FocusEvent) => unknown)
    | null;
  /**
   * Occurs when playback is possible, but would require further buffering.
   * @param ev The event.
   */
  readonly oncanplay:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  readonly oncanplaythrough:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Fires when the contents of the object or selection have changed.
   * @param ev The event.
   */
  readonly onchange: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  /**
   * Fires when the user clicks the left mouse button on the object
   * @param ev The mouse event.
   */
  readonly onclick:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  readonly onclose: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  /**
   * Fires when the user clicks the right mouse button in the client area, opening the context menu.
   * @param ev The mouse event.
   */
  readonly oncontextmenu:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  readonly oncuechange:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Fires when the user double-clicks the object.
   * @param ev The mouse event.
   */
  readonly ondblclick:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  /**
   * Fires on the source object continuously during a drag operation.
   * @param ev The event.
   */
  readonly ondrag:
    | ((this: GlobalEventHandlers, ev: DragEvent) => unknown)
    | null;
  /**
   * Fires on the source object when the user releases the mouse at the close of a drag operation.
   * @param ev The event.
   */
  readonly ondragend:
    | ((this: GlobalEventHandlers, ev: DragEvent) => unknown)
    | null;
  /**
   * Fires on the target element when the user drags the object to a valid drop target.
   * @param ev The drag event.
   */
  readonly ondragenter:
    | ((this: GlobalEventHandlers, ev: DragEvent) => unknown)
    | null;
  /**
   * Fires on the target object when the user moves the mouse out of a valid drop target during a drag operation.
   * @param ev The drag event.
   */
  readonly ondragleave:
    | ((this: GlobalEventHandlers, ev: DragEvent) => unknown)
    | null;
  /**
   * Fires on the target element continuously while the user drags the object over a valid drop target.
   * @param ev The event.
   */
  readonly ondragover:
    | ((this: GlobalEventHandlers, ev: DragEvent) => unknown)
    | null;
  /**
   * Fires on the source object when the user starts to drag a text selection or selected object.
   * @param ev The event.
   */
  readonly ondragstart:
    | ((this: GlobalEventHandlers, ev: DragEvent) => unknown)
    | null;
  readonly ondrop:
    | ((this: GlobalEventHandlers, ev: DragEvent) => unknown)
    | null;
  /**
   * Occurs when the duration attribute is updated.
   * @param ev The event.
   */
  readonly ondurationchange:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Occurs when the media element is reset to its initial state.
   * @param ev The event.
   */
  readonly onemptied:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Occurs when the end of playback is reached.
   * @param ev The event
   */
  readonly onended: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  /**
   * Fires when an error occurs during object loading.
   * @param ev The event.
   */
  readonly onerror: OnErrorEventHandler;
  /**
   * Fires when the object receives focus.
   * @param ev The event.
   */
  readonly onfocus:
    | ((this: GlobalEventHandlers, ev: FocusEvent) => unknown)
    | null;
  readonly onformdata:
    | ((this: GlobalEventHandlers, ev: FormDataEvent) => unknown)
    | null;
  readonly ongotpointercapture:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  readonly oninput: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  readonly oninvalid:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Fires when the user presses a key.
   * @param ev The keyboard event
   */
  readonly onkeydown:
    | ((this: GlobalEventHandlers, ev: KeyboardEvent) => unknown)
    | null;
  /**
   * Fires when the user presses an alphanumeric key.
   * @param ev The event.
   * @deprecated
   */
  readonly onkeypress:
    | ((this: GlobalEventHandlers, ev: KeyboardEvent) => unknown)
    | null;
  /**
   * Fires when the user releases a key.
   * @param ev The keyboard event
   */
  readonly onkeyup:
    | ((this: GlobalEventHandlers, ev: KeyboardEvent) => unknown)
    | null;
  /**
   * Fires immediately after the browser loads the object.
   * @param ev The event.
   */
  readonly onload: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  /**
   * Occurs when media data is loaded at the current playback position.
   * @param ev The event.
   */
  readonly onloadeddata:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Occurs when the duration and dimensions of the media have been determined.
   * @param ev The event.
   */
  readonly onloadedmetadata:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Occurs when Internet Explorer begins looking for media data.
   * @param ev The event.
   */
  readonly onloadstart:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  readonly onlostpointercapture:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  /**
   * Fires when the user clicks the object with either mouse button.
   * @param ev The mouse event.
   */
  readonly onmousedown:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  readonly onmouseenter:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  readonly onmouseleave:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  /**
   * Fires when the user moves the mouse over the object.
   * @param ev The mouse event.
   */
  readonly onmousemove:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  /**
   * Fires when the user moves the mouse pointer outside the boundaries of the object.
   * @param ev The mouse event.
   */
  readonly onmouseout:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  /**
   * Fires when the user moves the mouse pointer into the object.
   * @param ev The mouse event.
   */
  readonly onmouseover:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  /**
   * Fires when the user releases a mouse button while the mouse is over the object.
   * @param ev The mouse event.
   */
  readonly onmouseup:
    | ((this: GlobalEventHandlers, ev: MouseEvent) => unknown)
    | null;
  /**
   * Occurs when playback is paused.
   * @param ev The event.
   */
  readonly onpause: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  /**
   * Occurs when the play method is requested.
   * @param ev The event.
   */
  readonly onplay: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  /**
   * Occurs when the audio or video has started playing.
   * @param ev The event.
   */
  readonly onplaying:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  readonly onpointercancel:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  readonly onpointerdown:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  readonly onpointerenter:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  readonly onpointerleave:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  readonly onpointermove:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  readonly onpointerout:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  readonly onpointerover:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  readonly onpointerup:
    | ((this: GlobalEventHandlers, ev: PointerEvent) => unknown)
    | null;
  /**
   * Occurs to indicate progress while downloading media data.
   * @param ev The event.
   */
  readonly onprogress:
    | ((this: GlobalEventHandlers, ev: ProgressEvent) => unknown)
    | null;
  /**
   * Occurs when the playback rate is increased or decreased.
   * @param ev The event.
   */
  readonly onratechange:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Fires when the user resets a form.
   * @param ev The event.
   */
  readonly onreset: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  readonly onresize:
    | ((this: GlobalEventHandlers, ev: UIEvent) => unknown)
    | null;
  /**
   * Fires when the user repositions the scroll box in the scroll bar on the object.
   * @param ev The event.
   */
  readonly onscroll: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  readonly onsecuritypolicyviolation:
    | ((this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent) => unknown)
    | null;
  /**
   * Occurs when the seek operation ends.
   * @param ev The event.
   */
  readonly onseeked: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  /**
   * Occurs when the current playback position is moved.
   * @param ev The event.
   */
  readonly onseeking:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Fires when the current selection changes.
   * @param ev The event.
   */
  readonly onselect: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  readonly onselectionchange:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  readonly onselectstart:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  readonly onslotchange:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Occurs when the download has stopped.
   * @param ev The event.
   */
  readonly onstalled:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  readonly onsubmit:
    | ((this: GlobalEventHandlers, ev: SubmitEvent) => unknown)
    | null;
  /**
   * Occurs if the load operation has been intentionally halted.
   * @param ev The event.
   */
  readonly onsuspend:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Occurs to indicate the current playback position.
   * @param ev The event.
   */
  readonly ontimeupdate:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  readonly ontoggle: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
  readonly ontouchcancel?:
    | ((this: GlobalEventHandlers, ev: TouchEvent) => unknown)
    | null
    | undefined;
  readonly ontouchend?:
    | ((this: GlobalEventHandlers, ev: TouchEvent) => unknown)
    | null
    | undefined;
  readonly ontouchmove?:
    | ((this: GlobalEventHandlers, ev: TouchEvent) => unknown)
    | null
    | undefined;
  readonly ontouchstart?:
    | ((this: GlobalEventHandlers, ev: TouchEvent) => unknown)
    | null
    | undefined;
  readonly ontransitioncancel:
    | ((this: GlobalEventHandlers, ev: TransitionEvent) => unknown)
    | null;
  readonly ontransitionend:
    | ((this: GlobalEventHandlers, ev: TransitionEvent) => unknown)
    | null;
  readonly ontransitionrun:
    | ((this: GlobalEventHandlers, ev: TransitionEvent) => unknown)
    | null;
  readonly ontransitionstart:
    | ((this: GlobalEventHandlers, ev: TransitionEvent) => unknown)
    | null;
  /**
   * Occurs when the volume is changed, or playback is muted or unmuted.
   * @param ev The event.
   */
  readonly onvolumechange:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /**
   * Occurs when playback stops because the next frame of a video resource is not available.
   * @param ev The event.
   */
  readonly onwaiting:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /** @deprecated This is a legacy alias of `onanimationend`. */
  readonly onwebkitanimationend:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /** @deprecated This is a legacy alias of `onanimationiteration`. */
  readonly onwebkitanimationiteration:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /** @deprecated This is a legacy alias of `onanimationstart`. */
  readonly onwebkitanimationstart:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  /** @deprecated This is a legacy alias of `ontransitionend`. */
  readonly onwebkittransitionend:
    | ((this: GlobalEventHandlers, ev: Event) => unknown)
    | null;
  readonly onwheel:
    | ((this: GlobalEventHandlers, ev: WheelEvent) => unknown)
    | null;
  addEventListener<K extends keyof GlobalEventHandlersEventMap>(
    type: K,
    listener: (
      this: GlobalEventHandlers,
      ev: GlobalEventHandlersEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof GlobalEventHandlersEventMap>(
    type: K,
    listener: (
      this: GlobalEventHandlers,
      ev: GlobalEventHandlersEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface HTMLAllCollection {
  /** Returns the number of elements in the collection. */
  readonly length: number;
  /** Returns the item with index index from the collection (determined by tree order). */
  item(nameOrIndex?: string): HTMLCollection | Element | null;
  /**
   * Returns the item with ID or name name from the collection.
   *
   * If there are multiple matching items, then an HTMLCollection object containing all those elements is returned.
   *
   * Only button, form, iframe, input, map, meta, object, select, and textarea elements can have a name for the purpose of this method; their name is given by the value of their name attribute.
   */
  namedItem(name: string): HTMLCollection | Element | null;
  readonly [index: number]: Element;
}

declare const HTMLAllCollection: {
  readonly prototype: HTMLAllCollection;
  new (): HTMLAllCollection;
};

/** Hyperlink elements and provides special properties and methods (beyond those of the regular HTMLElement object interface that they inherit from) for manipulating the layout and presentation of such elements. */
interface HTMLAnchorElement extends HTMLElement, HTMLHyperlinkElementUtils {
  /**
   * Sets or retrieves the character set used to encode the object.
   * @deprecated
   */
  readonly charset: string;
  /**
   * Sets or retrieves the coordinates of the object.
   * @deprecated
   */
  readonly coords: string;
  readonly download: string;
  /** Sets or retrieves the language code of the object. */
  readonly hreflang: string;
  /**
   * Sets or retrieves the shape of the object.
   * @deprecated
   */
  readonly name: string;
  readonly ping: string;
  readonly referrerPolicy: string;
  /** Sets or retrieves the relationship between the object and the destination of the link. */
  readonly rel: string;
  readonly relList: DOMTokenList;
  /**
   * Sets or retrieves the relationship between the object and the destination of the link.
   * @deprecated
   */
  readonly rev: string;
  /**
   * Sets or retrieves the shape of the object.
   * @deprecated
   */
  readonly shape: string;
  /** Sets or retrieves the window or frame at which to target content. */
  readonly target: string;
  /** Retrieves or sets the text of the object as a string. */
  readonly text: string;
  readonly type: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLAnchorElement: {
  readonly prototype: HTMLAnchorElement;
  new (): HTMLAnchorElement;
};

/** Provides special properties and methods (beyond those of the regular object HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of <area> elements. */
interface HTMLAreaElement extends HTMLElement, HTMLHyperlinkElementUtils {
  /** Sets or retrieves a text alternative to the graphic. */
  readonly alt: string;
  /** Sets or retrieves the coordinates of the object. */
  readonly coords: string;
  readonly download: string;
  /**
   * Sets or gets whether clicks in this region cause action.
   * @deprecated
   */
  readonly noHref: boolean;
  readonly ping: string;
  readonly referrerPolicy: string;
  readonly rel: string;
  readonly relList: DOMTokenList;
  /** Sets or retrieves the shape of the object. */
  readonly shape: string;
  /** Sets or retrieves the window or frame at which to target content. */
  readonly target: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLAreaElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLAreaElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLAreaElement: {
  readonly prototype: HTMLAreaElement;
  new (): HTMLAreaElement;
};

/** Provides access to the properties of <audio> elements, as well as methods to manipulate them. It derives from the HTMLMediaElement interface. */
interface HTMLAudioElement extends HTMLMediaElement {
  addEventListener<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (
      this: HTMLAudioElement,
      ev: HTMLMediaElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (
      this: HTMLAudioElement,
      ev: HTMLMediaElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLAudioElement: {
  readonly prototype: HTMLAudioElement;
  new (): HTMLAudioElement;
};

/** A HTML line break element (<br>). It inherits from HTMLElement. */
interface HTMLBRElement extends HTMLElement {
  /**
   * Sets or retrieves the side on which floating objects are not to be positioned when any IHTMLBlockElement is inserted into the document.
   * @deprecated
   */
  readonly clear: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLBRElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLBRElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLBRElement: {
  readonly prototype: HTMLBRElement;
  new (): HTMLBRElement;
};

/** Contains the base URI for a document. This object inherits all of the properties and methods as described in the HTMLElement interface. */
interface HTMLBaseElement extends HTMLElement {
  /** Gets or sets the baseline URL on which relative links are based. */
  readonly href: string;
  /** Sets or retrieves the window or frame at which to target content. */
  readonly target: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLBaseElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLBaseElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLBaseElement: {
  readonly prototype: HTMLBaseElement;
  new (): HTMLBaseElement;
};

interface HTMLBodyElementEventMap
  extends HTMLElementEventMap,
    WindowEventHandlersEventMap {
  readonly orientationchange: Event;
}

/** Provides special properties (beyond those inherited from the regular HTMLElement interface) for manipulating <body> elements. */
interface HTMLBodyElement extends HTMLElement, WindowEventHandlers {
  /** @deprecated */
  readonly aLink: string;
  /** @deprecated */
  readonly background: string;
  /** @deprecated */
  readonly bgColor: string;
  /** @deprecated */
  readonly link: string;
  /** @deprecated */
  readonly onorientationchange:
    | ((this: HTMLBodyElement, ev: Event) => unknown)
    | null;
  /** @deprecated */
  readonly text: string;
  /** @deprecated */
  readonly vLink: string;
  addEventListener<K extends keyof HTMLBodyElementEventMap>(
    type: K,
    listener: (
      this: HTMLBodyElement,
      ev: HTMLBodyElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLBodyElementEventMap>(
    type: K,
    listener: (
      this: HTMLBodyElement,
      ev: HTMLBodyElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLBodyElement: {
  readonly prototype: HTMLBodyElement;
  new (): HTMLBodyElement;
};

/** Provides properties and methods (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating <button> elements. */
interface HTMLButtonElement extends HTMLElement {
  readonly disabled: boolean;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  /** Overrides the action attribute (where the data on a form is sent) on the parent form element. */
  readonly formAction: string;
  /** Used to override the encoding (formEnctype attribute) specified on the form element. */
  readonly formEnctype: string;
  /** Overrides the submit method attribute previously specified on a form element. */
  readonly formMethod: string;
  /** Overrides any validation or required attributes on a form or form elements to allow it to be submitted without validation. This can be used to create a "save draft"-type submit option. */
  readonly formNoValidate: boolean;
  /** Overrides the target attribute on a form element. */
  readonly formTarget: string;
  readonly labels: NodeListOf<HTMLLabelElement>;
  /** Sets or retrieves the name of the object. */
  readonly name: string;
  /** Gets the classification and default behavior of the button. */
  readonly type: string;
  /** Returns the error message that would be displayed if the user submits the form, or an empty string if no error message. It also triggers the standard error message, such as "this is a required field". The result is that the user sees validation messages without actually submitting. */
  readonly validationMessage: string;
  /** Returns a  ValidityState object that represents the validity states of an element. */
  readonly validity: ValidityState;
  /** Sets or retrieves the default or selected value of the control. */
  readonly value: string;
  /** Returns whether an element will successfully validate based on forms validation rules and constraints. */
  readonly willValidate: boolean;
  /** Returns whether a form will validate when it is submitted, without having to submit it. */
  checkValidity(): boolean;
  reportValidity(): boolean;
  /**
   * Sets a custom error message that is displayed when a form is submitted.
   * @param error Sets a custom error message that is displayed when a form is submitted.
   */
  setCustomValidity(error: string): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLButtonElement: {
  readonly prototype: HTMLButtonElement;
  new (): HTMLButtonElement;
};

/** Provides properties and methods for manipulating the layout and presentation of <canvas> elements. The HTMLCanvasElement interface also inherits the properties and methods of the HTMLElement interface. */
interface HTMLCanvasElement extends HTMLElement {
  /** Gets or sets the height of a canvas element on a document. */
  readonly height: number;
  /** Gets or sets the width of a canvas element on a document. */
  readonly width: number;
  captureStream(frameRequestRate?: number): MediaStream;
  /**
   * Returns an object that provides methods and properties for drawing and manipulating images and graphics on a canvas element in a document. A context object includes information about colors, line widths, fonts, and other graphic parameters that can be drawn on a canvas.
   * @param contextId The identifier (ID) of the type of canvas to create. Internet Explorer 9 and Internet Explorer 10 support only a 2-D context using canvas.getContext("2d"); IE11 Preview also supports 3-D or WebGL context using canvas.getContext("experimental-webgl");
   */
  getContext(
    contextId: '2d',
    options?: CanvasRenderingContext2DSettings
  ): CanvasRenderingContext2D | null;
  getContext(
    contextId: 'bitmaprenderer',
    options?: ImageBitmapRenderingContextSettings
  ): ImageBitmapRenderingContext | null;
  getContext(
    contextId: 'webgl',
    options?: WebGLContextAttributes
  ): WebGLRenderingContext | null;
  getContext(
    contextId: 'webgl2',
    options?: WebGLContextAttributes
  ): WebGL2RenderingContext | null;
  getContext(contextId: string, options?: unknown): RenderingContext | null;
  toBlob(callback: BlobCallback, type?: string, quality?: unknown): void;
  /**
   * Returns the content of the current canvas as an image that you can use as a source for another canvas or an HTML element.
   * @param type The standard MIME type for the image format to return. If you do not specify this parameter, the default value is a PNG format image.
   */
  toDataURL(type?: string, quality?: unknown): string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLCanvasElement: {
  readonly prototype: HTMLCanvasElement;
  new (): HTMLCanvasElement;
};

/** A generic collection (array-like object similar to arguments) of elements (in document order) and offers methods and properties for selecting from the list. */
interface HTMLCollectionBase {
  /** Sets or retrieves the number of objects in a collection. */
  readonly length: number;
  /** Retrieves an object from various collections. */
  item(index: number): Element | null;
  readonly [index: number]: Element;
}

interface HTMLCollection extends HTMLCollectionBase {
  /** Retrieves a select object or an object from an options collection. */
  namedItem(name: string): Element | null;
}

declare const HTMLCollection: {
  readonly prototype: HTMLCollection;
  new (): HTMLCollection;
};

interface HTMLCollectionOf<T extends Element> extends HTMLCollectionBase {
  item(index: number): T | null;
  namedItem(name: string): T | null;
  readonly [index: number]: T;
}

/** Provides special properties (beyond those of the regular HTMLElement interface it also has available to it by inheritance) for manipulating definition list (<dl>) elements. */
interface HTMLDListElement extends HTMLElement {
  /** @deprecated */
  readonly compact: boolean;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDListElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDListElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLDListElement: {
  readonly prototype: HTMLDListElement;
  new (): HTMLDListElement;
};

/** Provides special properties (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating <data> elements. */
interface HTMLDataElement extends HTMLElement {
  readonly value: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDataElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDataElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLDataElement: {
  readonly prototype: HTMLDataElement;
  new (): HTMLDataElement;
};

/** Provides special properties (beyond the HTMLElement object interface it also has available to it by inheritance) to manipulate <datalist> elements and their content. */
interface HTMLDataListElement extends HTMLElement {
  /** Returns an HTMLCollection of the option elements of the datalist element. */
  readonly options: HTMLCollectionOf<HTMLOptionElement>;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLDataListElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLDataListElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLDataListElement: {
  readonly prototype: HTMLDataListElement;
  new (): HTMLDataListElement;
};

interface HTMLDetailsElement extends HTMLElement {
  readonly open: boolean;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDetailsElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDetailsElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLDetailsElement: {
  readonly prototype: HTMLDetailsElement;
  new (): HTMLDetailsElement;
};

interface HTMLDialogElement extends HTMLElement {
  readonly open: boolean;
  readonly returnValue: string;
  /**
   * Closes the dialog element.
   *
   * The argument, if provided, provides a return value.
   */
  close(returnValue?: string): void;
  /** Displays the dialog element. */
  show(): void;
  showModal(): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLDialogElement: {
  readonly prototype: HTMLDialogElement;
  new (): HTMLDialogElement;
};

/** @deprecated */
interface HTMLDirectoryElement extends HTMLElement {
  /** @deprecated */
  readonly compact: boolean;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLDirectoryElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLDirectoryElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** @deprecated */
declare const HTMLDirectoryElement: {
  readonly prototype: HTMLDirectoryElement;
  new (): HTMLDirectoryElement;
};

/** Provides special properties (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating <div> elements. */
interface HTMLDivElement extends HTMLElement {
  /**
   * Sets or retrieves how the object is aligned with adjacent text.
   * @deprecated
   */
  readonly align: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLDivElement: {
  readonly prototype: HTMLDivElement;
  new (): HTMLDivElement;
};

/** @deprecated use Document */
interface HTMLDocument extends Document {
  addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: HTMLDocument, ev: DocumentEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: HTMLDocument, ev: DocumentEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** @deprecated */
declare const HTMLDocument: {
  readonly prototype: HTMLDocument;
  new (): HTMLDocument;
};

interface HTMLElementEventMap
  extends ElementEventMap,
    DocumentAndElementEventHandlersEventMap,
    GlobalEventHandlersEventMap {}

/** Any HTML element. Some elements directly implement this interface, while others implement it via an interface that inherits it. */
interface HTMLElement
  extends Element,
    DocumentAndElementEventHandlers,
    ElementCSSInlineStyle,
    ElementContentEditable,
    GlobalEventHandlers,
    HTMLOrSVGElement {
  readonly accessKey: string;
  readonly accessKeyLabel: string;
  readonly autocapitalize: string;
  readonly dir: string;
  readonly draggable: boolean;
  readonly hidden: boolean;
  readonly innerText: string;
  readonly lang: string;
  readonly offsetHeight: number;
  readonly offsetLeft: number;
  readonly offsetParent: Element | null;
  readonly offsetTop: number;
  readonly offsetWidth: number;
  readonly outerText: string;
  readonly spellcheck: boolean;
  readonly title: string;
  readonly translate: boolean;
  attachInternals(): ElementInternals;
  click(): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLElement: {
  readonly prototype: HTMLElement;
  new (): HTMLElement;
};

/** Provides special properties (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating <embed> elements. */
interface HTMLEmbedElement extends HTMLElement {
  /** @deprecated */
  readonly align: string;
  /** Sets or retrieves the height of the object. */
  readonly height: string;
  /**
   * Sets or retrieves the name of the object.
   * @deprecated
   */
  readonly name: string;
  /** Sets or retrieves a URL to be loaded by the object. */
  readonly src: string;
  readonly type: string;
  /** Sets or retrieves the width of the object. */
  readonly width: string;
  getSVGDocument(): Document | null;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLEmbedElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLEmbedElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLEmbedElement: {
  readonly prototype: HTMLEmbedElement;
  new (): HTMLEmbedElement;
};

/** Provides special properties and methods (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of <fieldset> elements. */
interface HTMLFieldSetElement extends HTMLElement {
  readonly disabled: boolean;
  /** Returns an HTMLCollection of the form controls in the element. */
  readonly elements: HTMLCollection;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  readonly name: string;
  /** Returns the string "fieldset". */
  readonly type: string;
  /** Returns the error message that would be displayed if the user submits the form, or an empty string if no error message. It also triggers the standard error message, such as "this is a required field". The result is that the user sees validation messages without actually submitting. */
  readonly validationMessage: string;
  /** Returns a  ValidityState object that represents the validity states of an element. */
  readonly validity: ValidityState;
  /** Returns whether an element will successfully validate based on forms validation rules and constraints. */
  readonly willValidate: boolean;
  /** Returns whether a form will validate when it is submitted, without having to submit it. */
  checkValidity(): boolean;
  reportValidity(): boolean;
  /**
   * Sets a custom error message that is displayed when a form is submitted.
   * @param error Sets a custom error message that is displayed when a form is submitted.
   */
  setCustomValidity(error: string): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLFieldSetElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLFieldSetElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLFieldSetElement: {
  readonly prototype: HTMLFieldSetElement;
  new (): HTMLFieldSetElement;
};

/**
 * Implements the document object model (DOM) representation of the font element. The HTML Font Element <font> defines the font size, font face and color of text.
 * @deprecated
 */
interface HTMLFontElement extends HTMLElement {
  /** @deprecated */
  readonly color: string;
  /**
   * Sets or retrieves the current typeface family.
   * @deprecated
   */
  readonly face: string;
  /** @deprecated */
  readonly size: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLFontElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLFontElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** @deprecated */
declare const HTMLFontElement: {
  readonly prototype: HTMLFontElement;
  new (): HTMLFontElement;
};

/** A collection of HTML form control elements.  */
interface HTMLFormControlsCollection extends HTMLCollectionBase {
  /**
   * Returns the item with ID or name name from the collection.
   *
   * If there are multiple matching items, then a RadioNodeList object containing all those elements is returned.
   */
  namedItem(name: string): RadioNodeList | Element | null;
}

declare const HTMLFormControlsCollection: {
  readonly prototype: HTMLFormControlsCollection;
  new (): HTMLFormControlsCollection;
};

/** A <form> element in the DOM; it allows access to and in some cases modification of aspects of the form, as well as access to its component elements. */
interface HTMLFormElement extends HTMLElement {
  /** Sets or retrieves a list of character encodings for input data that must be accepted by the server processing the form. */
  readonly acceptCharset: string;
  /** Sets or retrieves the URL to which the form content is sent for processing. */
  readonly action: string;
  /** Specifies whether autocomplete is applied to an editable text field. */
  readonly autocomplete: string;
  /** Retrieves a collection, in source order, of all controls in a given form. */
  readonly elements: HTMLFormControlsCollection;
  /** Sets or retrieves the MIME encoding for the form. */
  readonly encoding: string;
  /** Sets or retrieves the encoding type for the form. */
  readonly enctype: string;
  /** Sets or retrieves the number of objects in a collection. */
  readonly length: number;
  /** Sets or retrieves how to send the form data to the server. */
  readonly method: string;
  /** Sets or retrieves the name of the object. */
  readonly name: string;
  /** Designates a form that is not validated when submitted. */
  readonly noValidate: boolean;
  /** Sets or retrieves the window or frame at which to target content. */
  readonly target: string;
  /** Returns whether a form will validate when it is submitted, without having to submit it. */
  checkValidity(): boolean;
  reportValidity(): boolean;
  requestSubmit(submitter?: HTMLElement | null): void;
  /** Fires when the user resets a form. */
  reset(): void;
  /** Fires when a FORM is about to be submitted. */
  submit(): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLFormElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLFormElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  readonly [index: number]: Element;
  readonly [name: string]: unknown;
}

declare const HTMLFormElement: {
  readonly prototype: HTMLFormElement;
  new (): HTMLFormElement;
};

/** @deprecated */
interface HTMLFrameElement extends HTMLElement {
  /**
   * Retrieves the document object of the page or frame.
   * @deprecated
   */
  readonly contentDocument: Document | null;
  /**
   * Retrieves the object of the specified.
   * @deprecated
   */
  readonly contentWindow: WindowProxy | null;
  /**
   * Sets or retrieves whether to display a border for the frame.
   * @deprecated
   */
  readonly frameBorder: string;
  /**
   * Sets or retrieves a URI to a long description of the object.
   * @deprecated
   */
  readonly longDesc: string;
  /**
   * Sets or retrieves the top and bottom margin heights before displaying the text in a frame.
   * @deprecated
   */
  readonly marginHeight: string;
  /**
   * Sets or retrieves the left and right margin widths before displaying the text in a frame.
   * @deprecated
   */
  readonly marginWidth: string;
  /**
   * Sets or retrieves the frame name.
   * @deprecated
   */
  readonly name: string;
  /**
   * Sets or retrieves whether the user can resize the frame.
   * @deprecated
   */
  readonly noResize: boolean;
  /**
   * Sets or retrieves whether the frame can be scrolled.
   * @deprecated
   */
  readonly scrolling: string;
  /**
   * Sets or retrieves a URL to be loaded by the object.
   * @deprecated
   */
  readonly src: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLFrameElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLFrameElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** @deprecated */
declare const HTMLFrameElement: {
  readonly prototype: HTMLFrameElement;
  new (): HTMLFrameElement;
};

interface HTMLFrameSetElementEventMap
  extends HTMLElementEventMap,
    WindowEventHandlersEventMap {}

/**
 * Provides special properties (beyond those of the regular HTMLElement interface they also inherit) for manipulating <frameset> elements.
 * @deprecated
 */
interface HTMLFrameSetElement extends HTMLElement, WindowEventHandlers {
  /**
   * Sets or retrieves the frame widths of the object.
   * @deprecated
   */
  readonly cols: string;
  /**
   * Sets or retrieves the frame heights of the object.
   * @deprecated
   */
  readonly rows: string;
  addEventListener<K extends keyof HTMLFrameSetElementEventMap>(
    type: K,
    listener: (
      this: HTMLFrameSetElement,
      ev: HTMLFrameSetElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLFrameSetElementEventMap>(
    type: K,
    listener: (
      this: HTMLFrameSetElement,
      ev: HTMLFrameSetElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** @deprecated */
declare const HTMLFrameSetElement: {
  readonly prototype: HTMLFrameSetElement;
  new (): HTMLFrameSetElement;
};

/** Provides special properties (beyond those of the HTMLElement interface it also has available to it by inheritance) for manipulating <hr> elements. */
interface HTMLHRElement extends HTMLElement {
  /**
   * Sets or retrieves how the object is aligned with adjacent text.
   * @deprecated
   */
  readonly align: string;
  /** @deprecated */
  readonly color: string;
  /**
   * Sets or retrieves whether the horizontal rule is drawn with 3-D shading.
   * @deprecated
   */
  readonly noShade: boolean;
  /** @deprecated */
  readonly size: string;
  /**
   * Sets or retrieves the width of the object.
   * @deprecated
   */
  readonly width: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLHRElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLHRElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLHRElement: {
  readonly prototype: HTMLHRElement;
  new (): HTMLHRElement;
};

/** Contains the descriptive information, or metadata, for a document. This object inherits all of the properties and methods described in the HTMLElement interface. */
interface HTMLHeadElement extends HTMLElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLHeadElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLHeadElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLHeadElement: {
  readonly prototype: HTMLHeadElement;
  new (): HTMLHeadElement;
};

/** The different heading elements. It inherits methods and properties from the HTMLElement interface. */
interface HTMLHeadingElement extends HTMLElement {
  /**
   * Sets or retrieves a value that indicates the table alignment.
   * @deprecated
   */
  readonly align: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLHeadingElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLHeadingElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLHeadingElement: {
  readonly prototype: HTMLHeadingElement;
  new (): HTMLHeadingElement;
};

/** Serves as the root node for a given HTML document. This object inherits the properties and methods described in the HTMLElement interface. */
interface HTMLHtmlElement extends HTMLElement {
  /**
   * Sets or retrieves the DTD version that governs the current document.
   * @deprecated
   */
  readonly version: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLHtmlElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLHtmlElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLHtmlElement: {
  readonly prototype: HTMLHtmlElement;
  new (): HTMLHtmlElement;
};

interface HTMLHyperlinkElementUtils {
  /**
   * Returns the hyperlink's URL's fragment (includes leading "#" if non-empty).
   *
   * Can be set, to change the URL's fragment (ignores leading "#").
   */
  readonly hash: string;
  /**
   * Returns the hyperlink's URL's host and port (if different from the default port for the scheme).
   *
   * Can be set, to change the URL's host and port.
   */
  readonly host: string;
  /**
   * Returns the hyperlink's URL's host.
   *
   * Can be set, to change the URL's host.
   */
  readonly hostname: string;
  /**
   * Returns the hyperlink's URL.
   *
   * Can be set, to change the URL.
   */
  readonly href: string;
  toString(): string;
  /** Returns the hyperlink's URL's origin. */
  readonly origin: string;
  /**
   * Returns the hyperlink's URL's password.
   *
   * Can be set, to change the URL's password.
   */
  readonly password: string;
  /**
   * Returns the hyperlink's URL's path.
   *
   * Can be set, to change the URL's path.
   */
  readonly pathname: string;
  /**
   * Returns the hyperlink's URL's port.
   *
   * Can be set, to change the URL's port.
   */
  readonly port: string;
  /**
   * Returns the hyperlink's URL's scheme.
   *
   * Can be set, to change the URL's scheme.
   */
  readonly protocol: string;
  /**
   * Returns the hyperlink's URL's query (includes leading "?" if non-empty).
   *
   * Can be set, to change the URL's query (ignores leading "?").
   */
  readonly search: string;
  /**
   * Returns the hyperlink's URL's username.
   *
   * Can be set, to change the URL's username.
   */
  readonly username: string;
}

/** Provides special properties and methods (beyond those of the HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of inline frame elements. */
interface HTMLIFrameElement extends HTMLElement {
  /**
   * Sets or retrieves how the object is aligned with adjacent text.
   * @deprecated
   */
  readonly align: string;
  readonly allow: string;
  readonly allowFullscreen: boolean;
  /** Retrieves the document object of the page or frame. */
  readonly contentDocument: Document | null;
  /** Retrieves the object of the specified. */
  readonly contentWindow: WindowProxy | null;
  /**
   * Sets or retrieves whether to display a border for the frame.
   * @deprecated
   */
  readonly frameBorder: string;
  /** Sets or retrieves the height of the object. */
  readonly height: string;
  /**
   * Sets or retrieves a URI to a long description of the object.
   * @deprecated
   */
  readonly longDesc: string;
  /**
   * Sets or retrieves the top and bottom margin heights before displaying the text in a frame.
   * @deprecated
   */
  readonly marginHeight: string;
  /**
   * Sets or retrieves the left and right margin widths before displaying the text in a frame.
   * @deprecated
   */
  readonly marginWidth: string;
  /** Sets or retrieves the frame name. */
  readonly name: string;
  readonly referrerPolicy: ReferrerPolicy;
  readonly sandbox: DOMTokenList;
  /**
   * Sets or retrieves whether the frame can be scrolled.
   * @deprecated
   */
  readonly scrolling: string;
  /** Sets or retrieves a URL to be loaded by the object. */
  readonly src: string;
  /** Sets or retrives the content of the page that is to contain. */
  readonly srcdoc: string;
  /** Sets or retrieves the width of the object. */
  readonly width: string;
  getSVGDocument(): Document | null;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLIFrameElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLIFrameElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLIFrameElement: {
  readonly prototype: HTMLIFrameElement;
  new (): HTMLIFrameElement;
};

/** Provides special properties and methods for manipulating <img> elements. */
interface HTMLImageElement extends HTMLElement {
  /**
   * Sets or retrieves how the object is aligned with adjacent text.
   * @deprecated
   */
  readonly align: string;
  /** Sets or retrieves a text alternative to the graphic. */
  readonly alt: string;
  /**
   * Specifies the properties of a border drawn around an object.
   * @deprecated
   */
  readonly border: string;
  /** Retrieves whether the object is fully loaded. */
  readonly complete: boolean;
  readonly crossOrigin: string | null;
  readonly currentSrc: string;
  readonly decoding: 'async' | 'sync' | 'auto';
  /** Sets or retrieves the height of the object. */
  readonly height: number;
  /**
   * Sets or retrieves the width of the border to draw around the object.
   * @deprecated
   */
  readonly hspace: number;
  /** Sets or retrieves whether the image is a server-side image map. */
  readonly isMap: boolean;
  /** Sets or retrieves the policy for loading image elements that are outside the viewport. */
  readonly loading: 'eager' | 'lazy';
  /**
   * Sets or retrieves a Uniform Resource Identifier (URI) to a long description of the object.
   * @deprecated
   */
  readonly longDesc: string;
  /** @deprecated */
  readonly lowsrc: string;
  /**
   * Sets or retrieves the name of the object.
   * @deprecated
   */
  readonly name: string;
  /** The original height of the image resource before sizing. */
  readonly naturalHeight: number;
  /** The original width of the image resource before sizing. */
  readonly naturalWidth: number;
  readonly referrerPolicy: string;
  readonly sizes: string;
  /** The address or URL of the a media resource that is to be considered. */
  readonly src: string;
  readonly srcset: string;
  /** Sets or retrieves the URL, often with a bookmark extension (#name), to use as a client-side image map. */
  readonly useMap: string;
  /**
   * Sets or retrieves the vertical margin for the object.
   * @deprecated
   */
  readonly vspace: number;
  /** Sets or retrieves the width of the object. */
  readonly width: number;
  readonly x: number;
  readonly y: number;
  decode(): Promise<void>;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLImageElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLImageElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLImageElement: {
  readonly prototype: HTMLImageElement;
  new (): HTMLImageElement;
};

/** Provides special properties and methods for manipulating the options, layout, and presentation of <input> elements. */
interface HTMLInputElement extends HTMLElement {
  /** Sets or retrieves a comma-separated list of content types. */
  readonly accept: string;
  /**
   * Sets or retrieves how the object is aligned with adjacent text.
   * @deprecated
   */
  readonly align: string;
  /** Sets or retrieves a text alternative to the graphic. */
  readonly alt: string;
  /** Specifies whether autocomplete is applied to an editable text field. */
  readonly autocomplete: string;
  readonly capture: string;
  /** Sets or retrieves the state of the check box or radio button. */
  readonly checked: boolean;
  /** Sets or retrieves the state of the check box or radio button. */
  readonly defaultChecked: boolean;
  /** Sets or retrieves the initial contents of the object. */
  readonly defaultValue: string;
  readonly dirName: string;
  readonly disabled: boolean;
  /** Returns a FileList object on a file type input object. */
  readonly files: FileList | null;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  /** Overrides the action attribute (where the data on a form is sent) on the parent form element. */
  readonly formAction: string;
  /** Used to override the encoding (formEnctype attribute) specified on the form element. */
  readonly formEnctype: string;
  /** Overrides the submit method attribute previously specified on a form element. */
  readonly formMethod: string;
  /** Overrides any validation or required attributes on a form or form elements to allow it to be submitted without validation. This can be used to create a "save draft"-type submit option. */
  readonly formNoValidate: boolean;
  /** Overrides the target attribute on a form element. */
  readonly formTarget: string;
  /** Sets or retrieves the height of the object. */
  readonly height: number;
  /** When set, overrides the rendering of checkbox controls so that the current value is not visible. */
  readonly indeterminate: boolean;
  readonly labels: NodeListOf<HTMLLabelElement> | null;
  /** Specifies the ID of a pre-defined datalist of options for an input element. */
  readonly list: HTMLElement | null;
  /** Defines the maximum acceptable value for an input element with type="number".When used with the min and step attributes, lets you control the range and increment (such as only even numbers) that the user can enter into an input field. */
  readonly max: string;
  /** Sets or retrieves the maximum number of characters that the user can enter in a text control. */
  readonly maxLength: number;
  /** Defines the minimum acceptable value for an input element with type="number". When used with the max and step attributes, lets you control the range and increment (such as even numbers only) that the user can enter into an input field. */
  readonly min: string;
  readonly minLength: number;
  /** Sets or retrieves the Boolean value indicating whether multiple items can be selected from a list. */
  readonly multiple: boolean;
  /** Sets or retrieves the name of the object. */
  readonly name: string;
  /** Gets or sets a string containing a regular expression that the user's input must match. */
  readonly pattern: string;
  /** Gets or sets a text string that is displayed in an input field as a hint or prompt to users as the format or type of information they need to enter.The text appears in an input field until the user puts focus on the field. */
  readonly placeholder: string;
  readonly readOnly: boolean;
  /** When present, marks an element that can't be submitted without a value. */
  readonly required: boolean;
  readonly selectionDirection: 'forward' | 'backward' | 'none' | null;
  /** Gets or sets the end position or offset of a text selection. */
  readonly selectionEnd: number | null;
  /** Gets or sets the starting position or offset of a text selection. */
  readonly selectionStart: number | null;
  readonly size: number;
  /** The address or URL of the a media resource that is to be considered. */
  readonly src: string;
  /** Defines an increment or jump between values that you want to allow the user to enter. When used with the max and min attributes, lets you control the range and increment (for example, allow only even numbers) that the user can enter into an input field. */
  readonly step: string;
  /** Returns the content type of the object. */
  readonly type: string;
  /**
   * Sets or retrieves the URL, often with a bookmark extension (#name), to use as a client-side image map.
   * @deprecated
   */
  readonly useMap: string;
  /** Returns the error message that would be displayed if the user submits the form, or an empty string if no error message. It also triggers the standard error message, such as "this is a required field". The result is that the user sees validation messages without actually submitting. */
  readonly validationMessage: string;
  /** Returns a  ValidityState object that represents the validity states of an element. */
  readonly validity: ValidityState;
  /** Returns the value of the data at the cursor's current position. */
  readonly value: string;
  /** Returns a Date object representing the form control's value, if applicable; otherwise, returns null. Can be set, to change the value. Throws an "InvalidStateError" DOMException if the control isn't date- or time-based. */
  readonly valueAsDate: Date | null;
  /** Returns the input field value as a number. */
  readonly valueAsNumber: number;
  readonly webkitEntries: ReadonlyArray<FileSystemEntry>;
  readonly webkitdirectory: boolean;
  /** Sets or retrieves the width of the object. */
  readonly width: number;
  /** Returns whether an element will successfully validate based on forms validation rules and constraints. */
  readonly willValidate: boolean;
  /** Returns whether a form will validate when it is submitted, without having to submit it. */
  checkValidity(): boolean;
  reportValidity(): boolean;
  /** Makes the selection equal to the current object. */
  select(): void;
  /**
   * Sets a custom error message that is displayed when a form is submitted.
   * @param error Sets a custom error message that is displayed when a form is submitted.
   */
  setCustomValidity(error: string): void;
  setRangeText(replacement: string): void;
  setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectionMode?: SelectionMode
  ): void;
  /**
   * Sets the start and end positions of a selection in a text field.
   * @param start The offset into the text field for the start of the selection.
   * @param end The offset into the text field for the end of the selection.
   * @param direction The direction in which the selection is performed.
   */
  setSelectionRange(
    start: number | null,
    end: number | null,
    direction?: 'forward' | 'backward' | 'none'
  ): void;
  /**
   * Decrements a range input control's value by the value given by the Step attribute. If the optional parameter is used, it will decrement the input control's step value multiplied by the parameter's value.
   * @param n Value to decrement the value by.
   */
  stepDown(n?: number): void;
  /**
   * Increments a range input control's value by the value given by the Step attribute. If the optional parameter is used, will increment the input control's value by that value.
   * @param n Value to increment the value by.
   */
  stepUp(n?: number): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLInputElement: {
  readonly prototype: HTMLInputElement;
  new (): HTMLInputElement;
};

/** Exposes specific properties and methods (beyond those defined by regular HTMLElement interface it also has available to it by inheritance) for manipulating list elements. */
interface HTMLLIElement extends HTMLElement {
  /** @deprecated */
  readonly type: string;
  /** Sets or retrieves the value of a list item. */
  readonly value: number;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLLIElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLLIElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLLIElement: {
  readonly prototype: HTMLLIElement;
  new (): HTMLLIElement;
};

/** Gives access to properties specific to <label> elements. It inherits methods and properties from the base HTMLElement interface. */
interface HTMLLabelElement extends HTMLElement {
  /** Returns the form control that is associated with this element. */
  readonly control: HTMLElement | null;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  /** Sets or retrieves the object to which the given label object is assigned. */
  readonly htmlFor: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLLabelElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLLabelElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLLabelElement: {
  readonly prototype: HTMLLabelElement;
  new (): HTMLLabelElement;
};

/** The HTMLLegendElement is an interface allowing to access properties of the <legend> elements. It inherits properties and methods from the HTMLElement interface. */
interface HTMLLegendElement extends HTMLElement {
  /** @deprecated */
  readonly align: string;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLLegendElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLLegendElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLLegendElement: {
  readonly prototype: HTMLLegendElement;
  new (): HTMLLegendElement;
};

/** Reference information for external resources and the relationship of those resources to a document and vice-versa. This object inherits all of the properties and methods of the HTMLElement interface. */
interface HTMLLinkElement extends HTMLElement, LinkStyle {
  readonly as: string;
  /**
   * Sets or retrieves the character set used to encode the object.
   * @deprecated
   */
  readonly charset: string;
  readonly crossOrigin: string | null;
  readonly disabled: boolean;
  /** Sets or retrieves a destination URL or an anchor point. */
  readonly href: string;
  /** Sets or retrieves the language code of the object. */
  readonly hreflang: string;
  readonly imageSizes: string;
  readonly imageSrcset: string;
  readonly integrity: string;
  /** Sets or retrieves the media type. */
  readonly media: string;
  readonly referrerPolicy: string;
  /** Sets or retrieves the relationship between the object and the destination of the link. */
  readonly rel: string;
  readonly relList: DOMTokenList;
  /**
   * Sets or retrieves the relationship between the object and the destination of the link.
   * @deprecated
   */
  readonly rev: string;
  readonly sizes: DOMTokenList;
  /**
   * Sets or retrieves the window or frame at which to target content.
   * @deprecated
   */
  readonly target: string;
  /** Sets or retrieves the MIME type of the object. */
  readonly type: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLLinkElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLLinkElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLLinkElement: {
  readonly prototype: HTMLLinkElement;
  new (): HTMLLinkElement;
};

/** Provides special properties and methods (beyond those of the regular object HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of map elements. */
interface HTMLMapElement extends HTMLElement {
  /** Retrieves a collection of the area objects defined for the given map object. */
  readonly areas: HTMLCollection;
  /** Sets or retrieves the name of the object. */
  readonly name: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMapElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMapElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLMapElement: {
  readonly prototype: HTMLMapElement;
  new (): HTMLMapElement;
};

/**
 * Provides methods to manipulate <marquee> elements.
 * @deprecated
 */
interface HTMLMarqueeElement extends HTMLElement {
  /** @deprecated */
  readonly behavior: string;
  /** @deprecated */
  readonly bgColor: string;
  /** @deprecated */
  readonly direction: string;
  /** @deprecated */
  readonly height: string;
  /** @deprecated */
  readonly hspace: number;
  /** @deprecated */
  readonly loop: number;
  /** @deprecated */
  readonly scrollAmount: number;
  /** @deprecated */
  readonly scrollDelay: number;
  /** @deprecated */
  readonly trueSpeed: boolean;
  /** @deprecated */
  readonly vspace: number;
  /** @deprecated */
  readonly width: string;
  /** @deprecated */
  start(): void;
  /** @deprecated */
  stop(): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMarqueeElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMarqueeElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** @deprecated */
declare const HTMLMarqueeElement: {
  readonly prototype: HTMLMarqueeElement;
  new (): HTMLMarqueeElement;
};

interface HTMLMediaElementEventMap extends HTMLElementEventMap {
  readonly encrypted: MediaEncryptedEvent;
  readonly waitingforkey: Event;
}

/** Adds to HTMLElement the properties and methods needed to support basic media-related capabilities that are common to audio and video. */
interface HTMLMediaElement extends HTMLElement {
  /** Gets or sets a value that indicates whether to start playing the media automatically. */
  readonly autoplay: boolean;
  /** Gets a collection of buffered time ranges. */
  readonly buffered: TimeRanges;
  /** Gets or sets a flag that indicates whether the client provides a set of controls for the media (in case the developer does not include controls for the player). */
  readonly controls: boolean;
  readonly crossOrigin: string | null;
  /** Gets the address or URL of the current media resource that is selected by IHTMLMediaElement. */
  readonly currentSrc: string;
  /** Gets or sets the current playback position, in seconds. */
  readonly currentTime: number;
  readonly defaultMuted: boolean;
  /** Gets or sets the default playback rate when the user is not using fast forward or reverse for a video or audio resource. */
  readonly defaultPlaybackRate: number;
  readonly disableRemotePlayback: boolean;
  /** Returns the duration in seconds of the current media resource. A NaN value is returned if duration is not available, or Infinity if the media resource is streaming. */
  readonly duration: number;
  /** Gets information about whether the playback has ended or not. */
  readonly ended: boolean;
  /** Returns an object representing the current error state of the audio or video element. */
  readonly error: MediaError | null;
  /** Gets or sets a flag to specify whether playback should restart after it completes. */
  readonly loop: boolean;
  /** Available only in secure contexts. */
  readonly mediaKeys: MediaKeys | null;
  /** Gets or sets a flag that indicates whether the audio (either audio or the audio track on video media) is muted. */
  readonly muted: boolean;
  /** Gets the current network activity for the element. */
  readonly networkState: number;
  readonly onencrypted:
    | ((this: HTMLMediaElement, ev: MediaEncryptedEvent) => unknown)
    | null;
  readonly onwaitingforkey:
    | ((this: HTMLMediaElement, ev: Event) => unknown)
    | null;
  /** Gets a flag that specifies whether playback is paused. */
  readonly paused: boolean;
  /** Gets or sets the current rate of speed for the media resource to play. This speed is expressed as a multiple of the normal speed of the media resource. */
  readonly playbackRate: number;
  /** Gets TimeRanges for the current media resource that has been played. */
  readonly played: TimeRanges;
  /** Gets or sets a value indicating what data should be preloaded, if any. */
  readonly preload: 'none' | 'metadata' | 'auto' | '';
  readonly readyState: number;
  readonly remote: RemotePlayback;
  /** Returns a TimeRanges object that represents the ranges of the current media resource that can be seeked. */
  readonly seekable: TimeRanges;
  /** Gets a flag that indicates whether the client is currently moving to a new playback position in the media resource. */
  readonly seeking: boolean;
  /** The address or URL of the a media resource that is to be considered. */
  readonly src: string;
  readonly srcObject: MediaProvider | null;
  readonly textTracks: TextTrackList;
  /** Gets or sets the volume level for audio portions of the media element. */
  readonly volume: number;
  addTextTrack(
    kind: TextTrackKind,
    label?: string,
    language?: string
  ): TextTrack;
  /** Returns a string that specifies whether the client can play a given media resource type. */
  canPlayType(type: string): CanPlayTypeResult;
  fastSeek(time: number): void;
  /** Resets the audio or video object and loads a new media resource. */
  load(): void;
  /** Pauses the current playback and sets paused to TRUE. This can be used to test whether the media is playing or paused. You can also use the pause or play events to tell whether the media is playing or not. */
  pause(): void;
  /** Loads and starts playback of a media resource. */
  play(): Promise<void>;
  /** Available only in secure contexts. */
  setMediaKeys(mediaKeys: MediaKeys | null): Promise<void>;
  readonly HAVE_CURRENT_DATA: number;
  readonly HAVE_ENOUGH_DATA: number;
  readonly HAVE_FUTURE_DATA: number;
  readonly HAVE_METADATA: number;
  readonly HAVE_NOTHING: number;
  readonly NETWORK_EMPTY: number;
  readonly NETWORK_IDLE: number;
  readonly NETWORK_LOADING: number;
  readonly NETWORK_NO_SOURCE: number;
  addEventListener<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (
      this: HTMLMediaElement,
      ev: HTMLMediaElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (
      this: HTMLMediaElement,
      ev: HTMLMediaElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLMediaElement: {
  readonly prototype: HTMLMediaElement;
  new (): HTMLMediaElement;
  readonly HAVE_CURRENT_DATA: number;
  readonly HAVE_ENOUGH_DATA: number;
  readonly HAVE_FUTURE_DATA: number;
  readonly HAVE_METADATA: number;
  readonly HAVE_NOTHING: number;
  readonly NETWORK_EMPTY: number;
  readonly NETWORK_IDLE: number;
  readonly NETWORK_LOADING: number;
  readonly NETWORK_NO_SOURCE: number;
};

interface HTMLMenuElement extends HTMLElement {
  /** @deprecated */
  readonly compact: boolean;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMenuElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMenuElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLMenuElement: {
  readonly prototype: HTMLMenuElement;
  new (): HTMLMenuElement;
};

/** Contains descriptive metadata about a document. It inherits all of the properties and methods described in the HTMLElement interface. */
interface HTMLMetaElement extends HTMLElement {
  /** Gets or sets meta-information to associate with httpEquiv or name. */
  readonly content: string;
  /** Gets or sets information used to bind the value of a content attribute of a meta element to an HTTP response header. */
  readonly httpEquiv: string;
  readonly media: string;
  /** Sets or retrieves the value specified in the content attribute of the meta object. */
  readonly name: string;
  /**
   * Sets or retrieves a scheme to be used in interpreting the value of a property specified for the object.
   * @deprecated
   */
  readonly scheme: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMetaElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMetaElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLMetaElement: {
  readonly prototype: HTMLMetaElement;
  new (): HTMLMetaElement;
};

/** The HTML <meter> elements expose the HTMLMeterElement interface, which provides special properties and methods (beyond the HTMLElement object interface they also have available to them by inheritance) for manipulating the layout and presentation of <meter> elements. */
interface HTMLMeterElement extends HTMLElement {
  readonly high: number;
  readonly labels: NodeListOf<HTMLLabelElement>;
  readonly low: number;
  readonly max: number;
  readonly min: number;
  readonly optimum: number;
  readonly value: number;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMeterElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLMeterElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLMeterElement: {
  readonly prototype: HTMLMeterElement;
  new (): HTMLMeterElement;
};

/** Provides special properties (beyond the regular methods and properties available through the HTMLElement interface they also have available to them by inheritance) for manipulating modification elements, that is <del> and <ins>. */
interface HTMLModElement extends HTMLElement {
  /** Sets or retrieves reference information about the object. */
  readonly cite: string;
  /** Sets or retrieves the date and time of a modification to the object. */
  readonly dateTime: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLModElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLModElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLModElement: {
  readonly prototype: HTMLModElement;
  new (): HTMLModElement;
};

/** Provides special properties (beyond those defined on the regular HTMLElement interface it also has available to it by inheritance) for manipulating ordered list elements. */
interface HTMLOListElement extends HTMLElement {
  /** @deprecated */
  readonly compact: boolean;
  readonly reversed: boolean;
  /** The starting number. */
  readonly start: number;
  readonly type: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLOListElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLOListElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLOListElement: {
  readonly prototype: HTMLOListElement;
  new (): HTMLOListElement;
};

/** Provides special properties and methods (beyond those on the HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of <object> element, representing external resources. */
interface HTMLObjectElement extends HTMLElement {
  /** @deprecated */
  readonly align: string;
  /**
   * Sets or retrieves a character string that can be used to implement your own archive functionality for the object.
   * @deprecated
   */
  readonly archive: string;
  /** @deprecated */
  readonly border: string;
  /**
   * Sets or retrieves the URL of the file containing the compiled Java class.
   * @deprecated
   */
  readonly code: string;
  /**
   * Sets or retrieves the URL of the component.
   * @deprecated
   */
  readonly codeBase: string;
  /**
   * Sets or retrieves the Internet media type for the code associated with the object.
   * @deprecated
   */
  readonly codeType: string;
  /** Retrieves the document object of the page or frame. */
  readonly contentDocument: Document | null;
  readonly contentWindow: WindowProxy | null;
  /** Sets or retrieves the URL that references the data of the object. */
  readonly data: string;
  /** @deprecated */
  readonly declare: boolean;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  /** Sets or retrieves the height of the object. */
  readonly height: string;
  /** @deprecated */
  readonly hspace: number;
  /** Sets or retrieves the name of the object. */
  readonly name: string;
  /**
   * Sets or retrieves a message to be displayed while an object is loading.
   * @deprecated
   */
  readonly standby: string;
  /** Sets or retrieves the MIME type of the object. */
  readonly type: string;
  /** Sets or retrieves the URL, often with a bookmark extension (#name), to use as a client-side image map. */
  readonly useMap: string;
  /** Returns the error message that would be displayed if the user submits the form, or an empty string if no error message. It also triggers the standard error message, such as "this is a required field". The result is that the user sees validation messages without actually submitting. */
  readonly validationMessage: string;
  /** Returns a  ValidityState object that represents the validity states of an element. */
  readonly validity: ValidityState;
  /** @deprecated */
  readonly vspace: number;
  /** Sets or retrieves the width of the object. */
  readonly width: string;
  /** Returns whether an element will successfully validate based on forms validation rules and constraints. */
  readonly willValidate: boolean;
  /** Returns whether a form will validate when it is submitted, without having to submit it. */
  checkValidity(): boolean;
  getSVGDocument(): Document | null;
  reportValidity(): boolean;
  /**
   * Sets a custom error message that is displayed when a form is submitted.
   * @param error Sets a custom error message that is displayed when a form is submitted.
   */
  setCustomValidity(error: string): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLObjectElement: {
  readonly prototype: HTMLObjectElement;
  new (): HTMLObjectElement;
};

/** Provides special properties and methods (beyond the regular HTMLElement object interface they also have available to them by inheritance) for manipulating the layout and presentation of <optgroup> elements. */
interface HTMLOptGroupElement extends HTMLElement {
  readonly disabled: boolean;
  /** Sets or retrieves a value that you can use to implement your own label functionality for the object. */
  readonly label: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLOptGroupElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLOptGroupElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLOptGroupElement: {
  readonly prototype: HTMLOptGroupElement;
  new (): HTMLOptGroupElement;
};

/** <option> elements and inherits all classes and methods of the HTMLElement interface. */
interface HTMLOptionElement extends HTMLElement {
  /** Sets or retrieves the status of an option. */
  readonly defaultSelected: boolean;
  readonly disabled: boolean;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  /** Sets or retrieves the ordinal position of an option in a list box. */
  readonly index: number;
  /** Sets or retrieves a value that you can use to implement your own label functionality for the object. */
  readonly label: string;
  /** Sets or retrieves whether the option in the list box is the default item. */
  readonly selected: boolean;
  /** Sets or retrieves the text string specified by the option tag. */
  readonly text: string;
  /** Sets or retrieves the value which is returned to the server when the form control is submitted. */
  readonly value: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLOptionElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLOptionElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLOptionElement: {
  readonly prototype: HTMLOptionElement;
  new (): HTMLOptionElement;
};

/** HTMLOptionsCollection is an interface representing a collection of HTML option elements (in document order) and offers methods and properties for traversing the list as well as optionally altering its items. This type is returned solely by the "options" property of select. */
interface HTMLOptionsCollection extends HTMLCollectionOf<HTMLOptionElement> {
  /**
   * Returns the number of elements in the collection.
   *
   * When set to a smaller number, truncates the number of option elements in the corresponding container.
   *
   * When set to a greater number, adds new blank option elements to that container.
   */
  readonly length: number;
  /**
   * Returns the index of the first selected item, if any, or −1 if there is no selected item.
   *
   * Can be set, to change the selection.
   */
  readonly selectedIndex: number;
  /**
   * Inserts element before the node given by before.
   *
   * The before argument can be a number, in which case element is inserted before the item with that number, or an element from the collection, in which case element is inserted before that element.
   *
   * If before is omitted, null, or a number out of range, then element will be added at the end of the list.
   *
   * This method will throw a "HierarchyRequestError" DOMException if element is an ancestor of the element into which it is to be inserted.
   */
  add(
    element: HTMLOptionElement | HTMLOptGroupElement,
    before?: HTMLElement | number | null
  ): void;
  /** Removes the item with index index from the collection. */
  remove(index: number): void;
}

declare const HTMLOptionsCollection: {
  readonly prototype: HTMLOptionsCollection;
  new (): HTMLOptionsCollection;
};

interface HTMLOrSVGElement {
  readonly autofocus: boolean;
  readonly dataset: DOMStringMap;
  readonly nonce?: string;
  readonly tabIndex: number;
  blur(): void;
  focus(options?: FocusOptions): void;
}

/** Provides properties and methods (beyond those inherited from HTMLElement) for manipulating the layout and presentation of <output> elements. */
interface HTMLOutputElement extends HTMLElement {
  readonly defaultValue: string;
  readonly form: HTMLFormElement | null;
  readonly htmlFor: DOMTokenList;
  readonly labels: NodeListOf<HTMLLabelElement>;
  readonly name: string;
  /** Returns the string "output". */
  readonly type: string;
  readonly validationMessage: string;
  readonly validity: ValidityState;
  /**
   * Returns the element's current value.
   *
   * Can be set, to change the value.
   */
  readonly value: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(error: string): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLOutputElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLOutputElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLOutputElement: {
  readonly prototype: HTMLOutputElement;
  new (): HTMLOutputElement;
};

/** Provides special properties (beyond those of the regular HTMLElement object interface it inherits) for manipulating <p> elements. */
interface HTMLParagraphElement extends HTMLElement {
  /**
   * Sets or retrieves how the object is aligned with adjacent text.
   * @deprecated
   */
  readonly align: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLParagraphElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLParagraphElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLParagraphElement: {
  readonly prototype: HTMLParagraphElement;
  new (): HTMLParagraphElement;
};

/** Provides special properties (beyond those of the regular HTMLElement object interface it inherits) for manipulating <param> elements, representing a pair of a key and a value that acts as a parameter for an <object> element. */
interface HTMLParamElement extends HTMLElement {
  /** Sets or retrieves the name of an input parameter for an element. */
  readonly name: string;
  /**
   * Sets or retrieves the content type of the resource designated by the value attribute.
   * @deprecated
   */
  readonly type: string;
  /** Sets or retrieves the value of an input parameter for an element. */
  readonly value: string;
  /**
   * Sets or retrieves the data type of the value attribute.
   * @deprecated
   */
  readonly valueType: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLParamElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLParamElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLParamElement: {
  readonly prototype: HTMLParamElement;
  new (): HTMLParamElement;
};

/** A <picture> HTML element. It doesn't implement specific properties or methods. */
interface HTMLPictureElement extends HTMLElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLPictureElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLPictureElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLPictureElement: {
  readonly prototype: HTMLPictureElement;
  new (): HTMLPictureElement;
};

/** Exposes specific properties and methods (beyond those of the HTMLElement interface it also has available to it by inheritance) for manipulating a block of preformatted text (<pre>). */
interface HTMLPreElement extends HTMLElement {
  /**
   * Sets or gets a value that you can use to implement your own width functionality for the object.
   * @deprecated
   */
  readonly width: number;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLPreElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLPreElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLPreElement: {
  readonly prototype: HTMLPreElement;
  new (): HTMLPreElement;
};

/** Provides special properties and methods (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of <progress> elements. */
interface HTMLProgressElement extends HTMLElement {
  readonly labels: NodeListOf<HTMLLabelElement>;
  /** Defines the maximum, or "done" value for a progress element. */
  readonly max: number;
  /** Returns the quotient of value/max when the value attribute is set (determinate progress bar), or -1 when the value attribute is missing (indeterminate progress bar). */
  readonly position: number;
  /** Sets or gets the current value of a progress element. The value must be a non-negative number between 0 and the max value. */
  readonly value: number;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLProgressElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLProgressElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLProgressElement: {
  readonly prototype: HTMLProgressElement;
  new (): HTMLProgressElement;
};

/** Provides special properties and methods (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating quoting elements, like <blockquote> and <q>, but not the <cite> element. */
interface HTMLQuoteElement extends HTMLElement {
  /** Sets or retrieves reference information about the object. */
  readonly cite: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLQuoteElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLQuoteElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLQuoteElement: {
  readonly prototype: HTMLQuoteElement;
  new (): HTMLQuoteElement;
};

/** HTML <script> elements expose the HTMLScriptElement interface, which provides special properties and methods for manipulating the behavior and execution of <script> elements (beyond the inherited HTMLElement interface). */
interface HTMLScriptElement extends HTMLElement {
  readonly async: boolean;
  /**
   * Sets or retrieves the character set used to encode the object.
   * @deprecated
   */
  readonly charset: string;
  readonly crossOrigin: string | null;
  /** Sets or retrieves the status of the script. */
  readonly defer: boolean;
  /**
   * Sets or retrieves the event for which the script is written.
   * @deprecated
   */
  readonly event: string;
  /**
   * Sets or retrieves the object that is bound to the event script.
   * @deprecated
   */
  readonly htmlFor: string;
  readonly integrity: string;
  readonly noModule: boolean;
  readonly referrerPolicy: string;
  /** Retrieves the URL to an external file that contains the source code or data. */
  readonly src: string;
  /** Retrieves or sets the text of the object as a string. */
  readonly text: string;
  /** Sets or retrieves the MIME type for the associated scripting engine. */
  readonly type: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLScriptElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLScriptElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLScriptElement: {
  readonly prototype: HTMLScriptElement;
  new (): HTMLScriptElement;
  supports(type: string): boolean;
};

/** A <select> HTML Element. These elements also share all of the properties and methods of other HTML elements via the HTMLElement interface. */
interface HTMLSelectElement extends HTMLElement {
  readonly autocomplete: string;
  readonly disabled: boolean;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  readonly labels: NodeListOf<HTMLLabelElement>;
  /** Sets or retrieves the number of objects in a collection. */
  readonly length: number;
  /** Sets or retrieves the Boolean value indicating whether multiple items can be selected from a list. */
  readonly multiple: boolean;
  /** Sets or retrieves the name of the object. */
  readonly name: string;
  /** Returns an HTMLOptionsCollection of the list of options. */
  readonly options: HTMLOptionsCollection;
  /** When present, marks an element that can't be submitted without a value. */
  readonly required: boolean;
  /** Sets or retrieves the index of the selected option in a select object. */
  readonly selectedIndex: number;
  readonly selectedOptions: HTMLCollectionOf<HTMLOptionElement>;
  /** Sets or retrieves the number of rows in the list box. */
  readonly size: number;
  /** Retrieves the type of select control based on the value of the MULTIPLE attribute. */
  readonly type: string;
  /** Returns the error message that would be displayed if the user submits the form, or an empty string if no error message. It also triggers the standard error message, such as "this is a required field". The result is that the user sees validation messages without actually submitting. */
  readonly validationMessage: string;
  /** Returns a  ValidityState object that represents the validity states of an element. */
  readonly validity: ValidityState;
  /** Sets or retrieves the value which is returned to the server when the form control is submitted. */
  readonly value: string;
  /** Returns whether an element will successfully validate based on forms validation rules and constraints. */
  readonly willValidate: boolean;
  /**
   * Adds an element to the areas, controlRange, or options collection.
   * @param element Variant of type Number that specifies the index position in the collection where the element is placed. If no value is given, the method places the element at the end of the collection.
   * @param before Variant of type Object that specifies an element to insert before, or null to append the object to the collection.
   */
  add(
    element: HTMLOptionElement | HTMLOptGroupElement,
    before?: HTMLElement | number | null
  ): void;
  /** Returns whether a form will validate when it is submitted, without having to submit it. */
  checkValidity(): boolean;
  /**
   * Retrieves a select object or an object from an options collection.
   * @param name Variant of type Number or String that specifies the object or collection to retrieve. If this parameter is an integer, it is the zero-based index of the object. If this parameter is a string, all objects with matching name or id properties are retrieved, and a collection is returned if more than one match is made.
   * @param index Variant of type Number that specifies the zero-based index of the object to retrieve when a collection is returned.
   */
  item(index: number): HTMLOptionElement | null;
  /**
   * Retrieves a select object or an object from an options collection.
   * @param namedItem A String that specifies the name or id property of the object to retrieve. A collection is returned if more than one match is made.
   */
  namedItem(name: string): HTMLOptionElement | null;
  /**
   * Removes an element from the collection.
   * @param index Number that specifies the zero-based index of the element to remove from the collection.
   */
  remove(): void;
  remove(index: number): void;
  reportValidity(): boolean;
  /**
   * Sets a custom error message that is displayed when a form is submitted.
   * @param error Sets a custom error message that is displayed when a form is submitted.
   */
  setCustomValidity(error: string): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLSelectElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLSelectElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  readonly [name: number]: HTMLOptionElement | HTMLOptGroupElement;
}

declare const HTMLSelectElement: {
  readonly prototype: HTMLSelectElement;
  new (): HTMLSelectElement;
};

interface HTMLSlotElement extends HTMLElement {
  readonly name: string;
  assign(...nodes: readonly (Element | Text)[]): void;
  assignedElements(options?: AssignedNodesOptions): readonly Element[];
  assignedNodes(options?: AssignedNodesOptions): readonly Node[];
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLSlotElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLSlotElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLSlotElement: {
  readonly prototype: HTMLSlotElement;
  new (): HTMLSlotElement;
};

/** Provides special properties (beyond the regular HTMLElement object interface it also has available to it by inheritance) for manipulating <source> elements. */
interface HTMLSourceElement extends HTMLElement {
  readonly height: number;
  /** Gets or sets the intended media type of the media source. */
  readonly media: string;
  readonly sizes: string;
  /** The address or URL of the a media resource that is to be considered. */
  readonly src: string;
  readonly srcset: string;
  /** Gets or sets the MIME type of a media resource. */
  readonly type: string;
  readonly width: number;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLSourceElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLSourceElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLSourceElement: {
  readonly prototype: HTMLSourceElement;
  new (): HTMLSourceElement;
};

/** A <span> element and derives from the HTMLElement interface, but without implementing any additional properties or methods. */
interface HTMLSpanElement extends HTMLElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLSpanElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLSpanElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLSpanElement: {
  readonly prototype: HTMLSpanElement;
  new (): HTMLSpanElement;
};

/** A <style> element. It inherits properties and methods from its parent, HTMLElement, and from LinkStyle. */
interface HTMLStyleElement extends HTMLElement, LinkStyle {
  /** Enables or disables the style sheet. */
  readonly disabled: boolean;
  /** Sets or retrieves the media type. */
  readonly media: string;
  /**
   * Retrieves the CSS language in which the style sheet is written.
   * @deprecated
   */
  readonly type: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLStyleElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLStyleElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLStyleElement: {
  readonly prototype: HTMLStyleElement;
  new (): HTMLStyleElement;
};

/** Special properties (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating table caption elements. */
interface HTMLTableCaptionElement extends HTMLElement {
  /**
   * Sets or retrieves the alignment of the caption or legend.
   * @deprecated
   */
  readonly align: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableCaptionElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableCaptionElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTableCaptionElement: {
  readonly prototype: HTMLTableCaptionElement;
  new (): HTMLTableCaptionElement;
};

/** Provides special properties and methods (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of table cells, either header or data cells, in an HTML document. */
interface HTMLTableCellElement extends HTMLElement {
  /** Sets or retrieves abbreviated text for the object. */
  readonly abbr: string;
  /**
   * Sets or retrieves how the object is aligned with adjacent text.
   * @deprecated
   */
  readonly align: string;
  /**
   * Sets or retrieves a comma-delimited list of conceptual categories associated with the object.
   * @deprecated
   */
  readonly axis: string;
  /** @deprecated */
  readonly bgColor: string;
  /** Retrieves the position of the object in the cells collection of a row. */
  readonly cellIndex: number;
  /** @deprecated */
  readonly ch: string;
  /** @deprecated */
  readonly chOff: string;
  /** Sets or retrieves the number columns in the table that the object should span. */
  readonly colSpan: number;
  /** Sets or retrieves a list of header cells that provide information for the object. */
  readonly headers: string;
  /**
   * Sets or retrieves the height of the object.
   * @deprecated
   */
  readonly height: string;
  /**
   * Sets or retrieves whether the browser automatically performs wordwrap.
   * @deprecated
   */
  readonly noWrap: boolean;
  /** Sets or retrieves how many rows in a table the cell should span. */
  readonly rowSpan: number;
  /** Sets or retrieves the group of cells in a table to which the object's information applies. */
  readonly scope: string;
  /** @deprecated */
  readonly vAlign: string;
  /**
   * Sets or retrieves the width of the object.
   * @deprecated
   */
  readonly width: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableCellElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableCellElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTableCellElement: {
  readonly prototype: HTMLTableCellElement;
  new (): HTMLTableCellElement;
};

/** Provides special properties (beyond the HTMLElement interface it also has available to it inheritance) for manipulating single or grouped table column elements. */
interface HTMLTableColElement extends HTMLElement {
  /**
   * Sets or retrieves the alignment of the object relative to the display or table.
   * @deprecated
   */
  readonly align: string;
  /** @deprecated */
  readonly ch: string;
  /** @deprecated */
  readonly chOff: string;
  /** Sets or retrieves the number of columns in the group. */
  readonly span: number;
  /** @deprecated */
  readonly vAlign: string;
  /**
   * Sets or retrieves the width of the object.
   * @deprecated
   */
  readonly width: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableColElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableColElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTableColElement: {
  readonly prototype: HTMLTableColElement;
  new (): HTMLTableColElement;
};

/** @deprecated prefer HTMLTableCellElement */
interface HTMLTableDataCellElement extends HTMLTableCellElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableDataCellElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableDataCellElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** Provides special properties and methods (beyond the regular HTMLElement object interface it also has available to it by inheritance) for manipulating the layout and presentation of tables in an HTML document. */
interface HTMLTableElement extends HTMLElement {
  /**
   * Sets or retrieves a value that indicates the table alignment.
   * @deprecated
   */
  readonly align: string;
  /** @deprecated */
  readonly bgColor: string;
  /**
   * Sets or retrieves the width of the border to draw around the object.
   * @deprecated
   */
  readonly border: string;
  /** Retrieves the caption object of a table. */
  readonly caption: HTMLTableCaptionElement | null;
  /**
   * Sets or retrieves the amount of space between the border of the cell and the content of the cell.
   * @deprecated
   */
  readonly cellPadding: string;
  /**
   * Sets or retrieves the amount of space between cells in a table.
   * @deprecated
   */
  readonly cellSpacing: string;
  /**
   * Sets or retrieves the way the border frame around the table is displayed.
   * @deprecated
   */
  readonly frame: string;
  /** Sets or retrieves the number of horizontal rows contained in the object. */
  readonly rows: HTMLCollectionOf<HTMLTableRowElement>;
  /**
   * Sets or retrieves which dividing lines (inner borders) are displayed.
   * @deprecated
   */
  readonly rules: string;
  /**
   * Sets or retrieves a description and/or structure of the object.
   * @deprecated
   */
  readonly summary: string;
  /** Retrieves a collection of all tBody objects in the table. Objects in this collection are in source order. */
  readonly tBodies: HTMLCollectionOf<HTMLTableSectionElement>;
  /** Retrieves the tFoot object of the table. */
  readonly tFoot: HTMLTableSectionElement | null;
  /** Retrieves the tHead object of the table. */
  readonly tHead: HTMLTableSectionElement | null;
  /**
   * Sets or retrieves the width of the object.
   * @deprecated
   */
  readonly width: string;
  /** Creates an empty caption element in the table. */
  createCaption(): HTMLTableCaptionElement;
  /** Creates an empty tBody element in the table. */
  createTBody(): HTMLTableSectionElement;
  /** Creates an empty tFoot element in the table. */
  createTFoot(): HTMLTableSectionElement;
  /** Returns the tHead element object if successful, or null otherwise. */
  createTHead(): HTMLTableSectionElement;
  /** Deletes the caption element and its contents from the table. */
  deleteCaption(): void;
  /**
   * Removes the specified row (tr) from the element and from the rows collection.
   * @param index Number that specifies the zero-based position in the rows collection of the row to remove.
   */
  deleteRow(index: number): void;
  /** Deletes the tFoot element and its contents from the table. */
  deleteTFoot(): void;
  /** Deletes the tHead element and its contents from the table. */
  deleteTHead(): void;
  /**
   * Creates a new row (tr) in the table, and adds the row to the rows collection.
   * @param index Number that specifies where to insert the row in the rows collection. The default value is -1, which appends the new row to the end of the rows collection.
   */
  insertRow(index?: number): HTMLTableRowElement;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLTableElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLTableElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTableElement: {
  readonly prototype: HTMLTableElement;
  new (): HTMLTableElement;
};

/** @deprecated prefer HTMLTableCellElement */
interface HTMLTableHeaderCellElement extends HTMLTableCellElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableHeaderCellElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableHeaderCellElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** Provides special properties and methods (beyond the HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of rows in an HTML table. */
interface HTMLTableRowElement extends HTMLElement {
  /**
   * Sets or retrieves how the object is aligned with adjacent text.
   * @deprecated
   */
  readonly align: string;
  /** @deprecated */
  readonly bgColor: string;
  /** Retrieves a collection of all cells in the table row. */
  readonly cells: HTMLCollectionOf<HTMLTableCellElement>;
  /** @deprecated */
  readonly ch: string;
  /** @deprecated */
  readonly chOff: string;
  /** Retrieves the position of the object in the rows collection for the table. */
  readonly rowIndex: number;
  /** Retrieves the position of the object in the collection. */
  readonly sectionRowIndex: number;
  /** @deprecated */
  readonly vAlign: string;
  /**
   * Removes the specified cell from the table row, as well as from the cells collection.
   * @param index Number that specifies the zero-based position of the cell to remove from the table row. If no value is provided, the last cell in the cells collection is deleted.
   */
  deleteCell(index: number): void;
  /**
   * Creates a new cell in the table row, and adds the cell to the cells collection.
   * @param index Number that specifies where to insert the cell in the tr. The default value is -1, which appends the new cell to the end of the cells collection.
   */
  insertCell(index?: number): HTMLTableCellElement;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableRowElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableRowElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTableRowElement: {
  readonly prototype: HTMLTableRowElement;
  new (): HTMLTableRowElement;
};

/** Provides special properties and methods (beyond the HTMLElement interface it also has available to it by inheritance) for manipulating the layout and presentation of sections, that is headers, footers and bodies, in an HTML table. */
interface HTMLTableSectionElement extends HTMLElement {
  /**
   * Sets or retrieves a value that indicates the table alignment.
   * @deprecated
   */
  readonly align: string;
  /** @deprecated */
  readonly ch: string;
  /** @deprecated */
  readonly chOff: string;
  /** Sets or retrieves the number of horizontal rows contained in the object. */
  readonly rows: HTMLCollectionOf<HTMLTableRowElement>;
  /** @deprecated */
  readonly vAlign: string;
  /**
   * Removes the specified row (tr) from the element and from the rows collection.
   * @param index Number that specifies the zero-based position in the rows collection of the row to remove.
   */
  deleteRow(index: number): void;
  /**
   * Creates a new row (tr) in the table, and adds the row to the rows collection.
   * @param index Number that specifies where to insert the row in the rows collection. The default value is -1, which appends the new row to the end of the rows collection.
   */
  insertRow(index?: number): HTMLTableRowElement;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableSectionElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTableSectionElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTableSectionElement: {
  readonly prototype: HTMLTableSectionElement;
  new (): HTMLTableSectionElement;
};

/** Enables access to the contents of an HTML <template> element. */
interface HTMLTemplateElement extends HTMLElement {
  /** Returns the template contents (a DocumentFragment). */
  readonly content: DocumentFragment;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTemplateElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTemplateElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTemplateElement: {
  readonly prototype: HTMLTemplateElement;
  new (): HTMLTemplateElement;
};

/** Provides special properties and methods for manipulating the layout and presentation of <textarea> elements. */
interface HTMLTextAreaElement extends HTMLElement {
  readonly autocomplete: string;
  /** Sets or retrieves the width of the object. */
  readonly cols: number;
  /** Sets or retrieves the initial contents of the object. */
  readonly defaultValue: string;
  readonly dirName: string;
  readonly disabled: boolean;
  /** Retrieves a reference to the form that the object is embedded in. */
  readonly form: HTMLFormElement | null;
  readonly labels: NodeListOf<HTMLLabelElement>;
  /** Sets or retrieves the maximum number of characters that the user can enter in a text control. */
  readonly maxLength: number;
  readonly minLength: number;
  /** Sets or retrieves the name of the object. */
  readonly name: string;
  /** Gets or sets a text string that is displayed in an input field as a hint or prompt to users as the format or type of information they need to enter.The text appears in an input field until the user puts focus on the field. */
  readonly placeholder: string;
  /** Sets or retrieves the value indicated whether the content of the object is read-only. */
  readonly readOnly: boolean;
  /** When present, marks an element that can't be submitted without a value. */
  readonly required: boolean;
  /** Sets or retrieves the number of horizontal rows contained in the object. */
  readonly rows: number;
  readonly selectionDirection: 'forward' | 'backward' | 'none';
  /** Gets or sets the end position or offset of a text selection. */
  readonly selectionEnd: number;
  /** Gets or sets the starting position or offset of a text selection. */
  readonly selectionStart: number;
  readonly textLength: number;
  /** Retrieves the type of control. */
  readonly type: string;
  /** Returns the error message that would be displayed if the user submits the form, or an empty string if no error message. It also triggers the standard error message, such as "this is a required field". The result is that the user sees validation messages without actually submitting. */
  readonly validationMessage: string;
  /** Returns a  ValidityState object that represents the validity states of an element. */
  readonly validity: ValidityState;
  /** Retrieves or sets the text in the entry field of the textArea element. */
  readonly value: string;
  /** Returns whether an element will successfully validate based on forms validation rules and constraints. */
  readonly willValidate: boolean;
  /** Sets or retrieves how to handle wordwrapping in the object. */
  readonly wrap: string;
  /** Returns whether a form will validate when it is submitted, without having to submit it. */
  checkValidity(): boolean;
  reportValidity(): boolean;
  /** Highlights the input area of a form element. */
  select(): void;
  /**
   * Sets a custom error message that is displayed when a form is submitted.
   * @param error Sets a custom error message that is displayed when a form is submitted.
   */
  setCustomValidity(error: string): void;
  setRangeText(replacement: string): void;
  setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectionMode?: SelectionMode
  ): void;
  /**
   * Sets the start and end positions of a selection in a text field.
   * @param start The offset into the text field for the start of the selection.
   * @param end The offset into the text field for the end of the selection.
   * @param direction The direction in which the selection is performed.
   */
  setSelectionRange(
    start: number | null,
    end: number | null,
    direction?: 'forward' | 'backward' | 'none'
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTextAreaElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (
      this: HTMLTextAreaElement,
      ev: HTMLElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTextAreaElement: {
  readonly prototype: HTMLTextAreaElement;
  new (): HTMLTextAreaElement;
};

/** Provides special properties (beyond the regular HTMLElement interface it also has available to it by inheritance) for manipulating <time> elements. */
interface HTMLTimeElement extends HTMLElement {
  readonly dateTime: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLTimeElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLTimeElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTimeElement: {
  readonly prototype: HTMLTimeElement;
  new (): HTMLTimeElement;
};

/** Contains the title for a document. This element inherits all of the properties and methods of the HTMLElement interface. */
interface HTMLTitleElement extends HTMLElement {
  /** Retrieves or sets the text of the object as a string. */
  readonly text: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLTitleElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLTitleElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTitleElement: {
  readonly prototype: HTMLTitleElement;
  new (): HTMLTitleElement;
};

/** The HTMLTrackElement */
interface HTMLTrackElement extends HTMLElement {
  readonly default: boolean;
  readonly kind: string;
  readonly label: string;
  readonly readyState: number;
  readonly src: string;
  readonly srclang: string;
  /** Returns the TextTrack object corresponding to the text track of the track element. */
  readonly track: TextTrack;
  readonly ERROR: number;
  readonly LOADED: number;
  readonly LOADING: number;
  readonly NONE: number;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLTrackElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLTrackElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLTrackElement: {
  readonly prototype: HTMLTrackElement;
  new (): HTMLTrackElement;
  readonly ERROR: number;
  readonly LOADED: number;
  readonly LOADING: number;
  readonly NONE: number;
};

/** Provides special properties (beyond those defined on the regular HTMLElement interface it also has available to it by inheritance) for manipulating unordered list elements. */
interface HTMLUListElement extends HTMLElement {
  /** @deprecated */
  readonly compact: boolean;
  /** @deprecated */
  readonly type: string;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLUListElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLUListElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLUListElement: {
  readonly prototype: HTMLUListElement;
  new (): HTMLUListElement;
};

/** An invalid HTML element and derives from the HTMLElement interface, but without implementing any additional properties or methods. */
interface HTMLUnknownElement extends HTMLElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLUnknownElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLUnknownElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLUnknownElement: {
  readonly prototype: HTMLUnknownElement;
  new (): HTMLUnknownElement;
};

interface HTMLVideoElementEventMap extends HTMLMediaElementEventMap {
  readonly enterpictureinpicture: Event;
  readonly leavepictureinpicture: Event;
}

/** Provides special properties and methods for manipulating video objects. It also inherits properties and methods of HTMLMediaElement and HTMLElement. */
interface HTMLVideoElement extends HTMLMediaElement {
  readonly disablePictureInPicture: boolean;
  /** Gets or sets the height of the video element. */
  readonly height: number;
  readonly onenterpictureinpicture:
    | ((this: HTMLVideoElement, ev: Event) => unknown)
    | null;
  readonly onleavepictureinpicture:
    | ((this: HTMLVideoElement, ev: Event) => unknown)
    | null;
  /** Gets or sets the playsinline of the video element. for example, On iPhone, video elements will now be allowed to play inline, and will not automatically enter fullscreen mode when playback begins. */
  readonly playsInline: boolean;
  /** Gets or sets a URL of an image to display, for example, like a movie poster. This can be a still frame from the video, or another image if no video data is available. */
  readonly poster: string;
  /** Gets the intrinsic height of a video in CSS pixels, or zero if the dimensions are not known. */
  readonly videoHeight: number;
  /** Gets the intrinsic width of a video in CSS pixels, or zero if the dimensions are not known. */
  readonly videoWidth: number;
  /** Gets or sets the width of the video element. */
  readonly width: number;
  cancelVideoFrameCallback(handle: number): void;
  getVideoPlaybackQuality(): VideoPlaybackQuality;
  requestPictureInPicture(): Promise<PictureInPictureWindow>;
  requestVideoFrameCallback(callback: VideoFrameRequestCallback): number;
  addEventListener<K extends keyof HTMLVideoElementEventMap>(
    type: K,
    listener: (
      this: HTMLVideoElement,
      ev: HTMLVideoElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLVideoElementEventMap>(
    type: K,
    listener: (
      this: HTMLVideoElement,
      ev: HTMLVideoElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const HTMLVideoElement: {
  readonly prototype: HTMLVideoElement;
  new (): HTMLVideoElement;
};

/** Events that fire when the fragment identifier of the URL has changed. */
interface HashChangeEvent extends Event {
  /** Returns the URL of the session history entry that is now current. */
  readonly newURL: string;
  /** Returns the URL of the session history entry that was previously current. */
  readonly oldURL: string;
}

declare const HashChangeEvent: {
  readonly prototype: HashChangeEvent;
  new (type: string, eventInitDict?: HashChangeEventInit): HashChangeEvent;
};

/** This Fetch API interface allows you to perform various actions on HTTP request and response headers. These actions include retrieving, setting, adding to, and removing. A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.  You can add to this using methods like append() (see Examples.) In all methods of this interface, header names are matched by case-insensitive byte sequence. */
interface Headers {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  forEach(
    callbackfn: (value: string, key: string, parent: Headers) => void,
    thisArg?: unknown
  ): void;
}

declare const Headers: {
  readonly prototype: Headers;
  new (init?: HeadersInit): Headers;
};

/** Allows manipulation of the browser session history, that is the pages visited in the tab or frame that the current page is loaded in. */
interface History {
  readonly length: number;
  readonly scrollRestoration: ScrollRestoration;
  readonly state: unknown;
  back(): void;
  forward(): void;
  go(delta?: number): void;
  pushState(data: unknown, unused: string, url?: string | URL | null): void;
  replaceState(data: unknown, unused: string, url?: string | URL | null): void;
}

declare const History: {
  readonly prototype: History;
  new (): History;
};

/** This IndexedDB API interface represents a cursor for traversing or iterating over multiple records in a database. */
interface IDBCursor {
  /** Returns the direction ("next", "nextunique", "prev" or "prevunique") of the cursor. */
  readonly direction: IDBCursorDirection;
  /** Returns the key of the cursor. Throws a "InvalidStateError" DOMException if the cursor is advancing or is finished. */
  readonly key: IDBValidKey;
  /** Returns the effective key of the cursor. Throws a "InvalidStateError" DOMException if the cursor is advancing or is finished. */
  readonly primaryKey: IDBValidKey;
  readonly request: IDBRequest;
  /** Returns the IDBObjectStore or IDBIndex the cursor was opened from. */
  readonly source: IDBObjectStore | IDBIndex;
  /** Advances the cursor through the next count records in range. */
  advance(count: number): void;
  /** Advances the cursor to the next record in range. */
  continue(key?: IDBValidKey): void;
  /** Advances the cursor to the next record in range matching or after key and primaryKey. Throws an "InvalidAccessError" DOMException if the source is not an index. */
  continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): void;
  /**
   * Delete the record pointed at by the cursor with a new value.
   *
   * If successful, request's result will be undefined.
   */
  delete(): IDBRequest<undefined>;
  /**
   * Updated the record pointed at by the cursor with a new value.
   *
   * Throws a "DataError" DOMException if the effective object store uses in-line keys and the key would have changed.
   *
   * If successful, request's result will be the record's key.
   */
  update(value: unknown): IDBRequest<IDBValidKey>;
}

declare const IDBCursor: {
  readonly prototype: IDBCursor;
  new (): IDBCursor;
};

/** This IndexedDB API interface represents a cursor for traversing or iterating over multiple records in a database. It is the same as the IDBCursor, except that it includes the value property. */
interface IDBCursorWithValue extends IDBCursor {
  /** Returns the cursor's current value. */
  readonly value: unknown;
}

declare const IDBCursorWithValue: {
  readonly prototype: IDBCursorWithValue;
  new (): IDBCursorWithValue;
};

interface IDBDatabaseEventMap {
  readonly abort: Event;
  readonly close: Event;
  readonly error: Event;
  readonly versionchange: IDBVersionChangeEvent;
}

/** This IndexedDB API interface provides a connection to a database; you can use an IDBDatabase object to open a transaction on your database then create, manipulate, and delete objects (data) in that database. The interface provides the only way to get and manage versions of the database. */
interface IDBDatabase extends EventTarget {
  /** Returns the name of the database. */
  readonly name: string;
  /** Returns a list of the names of object stores in the database. */
  readonly objectStoreNames: DOMStringList;
  readonly onabort: ((this: IDBDatabase, ev: Event) => unknown) | null;
  readonly onclose: ((this: IDBDatabase, ev: Event) => unknown) | null;
  readonly onerror: ((this: IDBDatabase, ev: Event) => unknown) | null;
  readonly onversionchange:
    | ((this: IDBDatabase, ev: IDBVersionChangeEvent) => unknown)
    | null;
  /** Returns the version of the database. */
  readonly version: number;
  /** Closes the connection once all running transactions have finished. */
  close(): void;
  /**
   * Creates a new object store with the given name and options and returns a new IDBObjectStore.
   *
   * Throws a "InvalidStateError" DOMException if not called within an upgrade transaction.
   */
  createObjectStore(
    name: string,
    options?: IDBObjectStoreParameters
  ): IDBObjectStore;
  /**
   * Deletes the object store with the given name.
   *
   * Throws a "InvalidStateError" DOMException if not called within an upgrade transaction.
   */
  deleteObjectStore(name: string): void;
  /** Returns a new transaction with the given mode ("readonly" or "readwrite") and scope which can be a single object store name or an array of names. */
  transaction(
    storeNames: string | readonly string[],
    mode?: IDBTransactionMode
  ): IDBTransaction;
  addEventListener<K extends keyof IDBDatabaseEventMap>(
    type: K,
    listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof IDBDatabaseEventMap>(
    type: K,
    listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const IDBDatabase: {
  readonly prototype: IDBDatabase;
  new (): IDBDatabase;
};

/** In the following code snippet, we make a request to open a database, and include handlers for the success and error cases. For a full working example, see our To-do Notifications app (view example live.) */
interface IDBFactory {
  /**
   * Compares two values as keys. Returns -1 if key1 precedes key2, 1 if key2 precedes key1, and 0 if the keys are equal.
   *
   * Throws a "DataError" DOMException if either input is not a valid key.
   */
  cmp(first: unknown, second: unknown): number;
  databases(): Promise<readonly IDBDatabaseInfo[]>;
  /** Attempts to delete the named database. If the database already exists and there are open connections that don't close in response to a versionchange event, the request will be blocked until all they close. If the request is successful request's result will be null. */
  deleteDatabase(name: string): IDBOpenDBRequest;
  /** Attempts to open a connection to the named database with the current version, or 1 if it does not already exist. If the request is successful request's result will be the connection. */
  open(name: string, version?: number): IDBOpenDBRequest;
}

declare const IDBFactory: {
  readonly prototype: IDBFactory;
  new (): IDBFactory;
};

/** IDBIndex interface of the IndexedDB API provides asynchronous access to an index in a database. An index is a kind of object store for looking up records in another object store, called the referenced object store. You use this interface to retrieve data. */
interface IDBIndex {
  readonly keyPath: string | readonly string[];
  readonly multiEntry: boolean;
  /** Returns the name of the index. */
  readonly name: string;
  /** Returns the IDBObjectStore the index belongs to. */
  readonly objectStore: IDBObjectStore;
  readonly unique: boolean;
  /**
   * Retrieves the number of records matching the given key or key range in query.
   *
   * If successful, request's result will be the count.
   */
  count(query?: IDBValidKey | IDBKeyRange): IDBRequest<number>;
  /**
   * Retrieves the value of the first record matching the given key or key range in query.
   *
   * If successful, request's result will be the value, or undefined if there was no matching record.
   */
  get(query: IDBValidKey | IDBKeyRange): IDBRequest<unknown>;
  /**
   * Retrieves the values of the records matching the given key or key range in query (up to count if given).
   *
   * If successful, request's result will be an Array of the values.
   */
  getAll(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number
  ): IDBRequest<readonly unknown[]>;
  /**
   * Retrieves the keys of records matching the given key or key range in query (up to count if given).
   *
   * If successful, request's result will be an Array of the keys.
   */
  getAllKeys(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number
  ): IDBRequest<readonly IDBValidKey[]>;
  /**
   * Retrieves the key of the first record matching the given key or key range in query.
   *
   * If successful, request's result will be the key, or undefined if there was no matching record.
   */
  getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined>;
  /**
   * Opens a cursor over the records matching query, ordered by direction. If query is null, all records in index are matched.
   *
   * If successful, request's result will be an IDBCursorWithValue, or null if there were no matching records.
   */
  openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ): IDBRequest<IDBCursorWithValue | null>;
  /**
   * Opens a cursor with key only flag set over the records matching query, ordered by direction. If query is null, all records in index are matched.
   *
   * If successful, request's result will be an IDBCursor, or null if there were no matching records.
   */
  openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ): IDBRequest<IDBCursor | null>;
}

declare const IDBIndex: {
  readonly prototype: IDBIndex;
  new (): IDBIndex;
};

/** A key range can be a single value or a range with upper and lower bounds or endpoints. If the key range has both upper and lower bounds, then it is bounded; if it has no bounds, it is unbounded. A bounded key range can either be open (the endpoints are excluded) or closed (the endpoints are included). To retrieve all keys within a certain range, you can use the following code constructs: */
interface IDBKeyRange {
  /** Returns lower bound, or undefined if none. */
  readonly lower: unknown;
  /** Returns true if the lower open flag is set, and false otherwise. */
  readonly lowerOpen: boolean;
  /** Returns upper bound, or undefined if none. */
  readonly upper: unknown;
  /** Returns true if the upper open flag is set, and false otherwise. */
  readonly upperOpen: boolean;
  /** Returns true if key is included in the range, and false otherwise. */
  includes(key: unknown): boolean;
}

declare const IDBKeyRange: {
  readonly prototype: IDBKeyRange;
  new (): IDBKeyRange;
  /** Returns a new IDBKeyRange spanning from lower to upper. If lowerOpen is true, lower is not included in the range. If upperOpen is true, upper is not included in the range. */
  bound(
    lower: unknown,
    upper: unknown,
    lowerOpen?: boolean,
    upperOpen?: boolean
  ): IDBKeyRange;
  /** Returns a new IDBKeyRange starting at key with no upper bound. If open is true, key is not included in the range. */
  lowerBound(lower: unknown, open?: boolean): IDBKeyRange;
  /** Returns a new IDBKeyRange spanning only key. */
  only(value: unknown): IDBKeyRange;
  /** Returns a new IDBKeyRange with no lower bound and ending at key. If open is true, key is not included in the range. */
  upperBound(upper: unknown, open?: boolean): IDBKeyRange;
};

/** This example shows a variety of different uses of object stores, from updating the data structure with IDBObjectStore.createIndex inside an onupgradeneeded function, to adding a new item to our object store with IDBObjectStore.add. For a full working example, see our To-do Notifications app (view example live.) */
interface IDBObjectStore {
  /** Returns true if the store has a key generator, and false otherwise. */
  readonly autoIncrement: boolean;
  /** Returns a list of the names of indexes in the store. */
  readonly indexNames: DOMStringList;
  /** Returns the key path of the store, or null if none. */
  readonly keyPath: string | readonly string[];
  /** Returns the name of the store. */
  readonly name: string;
  /** Returns the associated transaction. */
  readonly transaction: IDBTransaction;
  /**
   * Adds or updates a record in store with the given value and key.
   *
   * If the store uses in-line keys and key is specified a "DataError" DOMException will be thrown.
   *
   * If put() is used, any existing record with the key will be replaced. If add() is used, and if a record with the key already exists the request will fail, with request's error set to a "ConstraintError" DOMException.
   *
   * If successful, request's result will be the record's key.
   */
  add(value: unknown, key?: IDBValidKey): IDBRequest<IDBValidKey>;
  /**
   * Deletes all records in store.
   *
   * If successful, request's result will be undefined.
   */
  clear(): IDBRequest<undefined>;
  /**
   * Retrieves the number of records matching the given key or key range in query.
   *
   * If successful, request's result will be the count.
   */
  count(query?: IDBValidKey | IDBKeyRange): IDBRequest<number>;
  /**
   * Creates a new index in store with the given name, keyPath and options and returns a new IDBIndex. If the keyPath and options define constraints that cannot be satisfied with the data already in store the upgrade transaction will abort with a "ConstraintError" DOMException.
   *
   * Throws an "InvalidStateError" DOMException if not called within an upgrade transaction.
   */
  createIndex(
    name: string,
    keyPath: string | readonly string[],
    options?: IDBIndexParameters
  ): IDBIndex;
  /**
   * Deletes records in store with the given key or in the given key range in query.
   *
   * If successful, request's result will be undefined.
   */
  delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined>;
  /**
   * Deletes the index in store with the given name.
   *
   * Throws an "InvalidStateError" DOMException if not called within an upgrade transaction.
   */
  deleteIndex(name: string): void;
  /**
   * Retrieves the value of the first record matching the given key or key range in query.
   *
   * If successful, request's result will be the value, or undefined if there was no matching record.
   */
  get(query: IDBValidKey | IDBKeyRange): IDBRequest<unknown>;
  /**
   * Retrieves the values of the records matching the given key or key range in query (up to count if given).
   *
   * If successful, request's result will be an Array of the values.
   */
  getAll(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number
  ): IDBRequest<readonly unknown[]>;
  /**
   * Retrieves the keys of records matching the given key or key range in query (up to count if given).
   *
   * If successful, request's result will be an Array of the keys.
   */
  getAllKeys(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number
  ): IDBRequest<readonly IDBValidKey[]>;
  /**
   * Retrieves the key of the first record matching the given key or key range in query.
   *
   * If successful, request's result will be the key, or undefined if there was no matching record.
   */
  getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined>;
  index(name: string): IDBIndex;
  /**
   * Opens a cursor over the records matching query, ordered by direction. If query is null, all records in store are matched.
   *
   * If successful, request's result will be an IDBCursorWithValue pointing at the first matching record, or null if there were no matching records.
   */
  openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ): IDBRequest<IDBCursorWithValue | null>;
  /**
   * Opens a cursor with key only flag set over the records matching query, ordered by direction. If query is null, all records in store are matched.
   *
   * If successful, request's result will be an IDBCursor pointing at the first matching record, or null if there were no matching records.
   */
  openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ): IDBRequest<IDBCursor | null>;
  /**
   * Adds or updates a record in store with the given value and key.
   *
   * If the store uses in-line keys and key is specified a "DataError" DOMException will be thrown.
   *
   * If put() is used, any existing record with the key will be replaced. If add() is used, and if a record with the key already exists the request will fail, with request's error set to a "ConstraintError" DOMException.
   *
   * If successful, request's result will be the record's key.
   */
  put(value: unknown, key?: IDBValidKey): IDBRequest<IDBValidKey>;
}

declare const IDBObjectStore: {
  readonly prototype: IDBObjectStore;
  new (): IDBObjectStore;
};

interface IDBOpenDBRequestEventMap extends IDBRequestEventMap {
  readonly blocked: Event;
  readonly upgradeneeded: IDBVersionChangeEvent;
}

/** Also inherits methods from its parents IDBRequest and EventTarget. */
interface IDBOpenDBRequest extends IDBRequest<IDBDatabase> {
  readonly onblocked: ((this: IDBOpenDBRequest, ev: Event) => unknown) | null;
  readonly onupgradeneeded:
    | ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown)
    | null;
  addEventListener<K extends keyof IDBOpenDBRequestEventMap>(
    type: K,
    listener: (
      this: IDBOpenDBRequest,
      ev: IDBOpenDBRequestEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof IDBOpenDBRequestEventMap>(
    type: K,
    listener: (
      this: IDBOpenDBRequest,
      ev: IDBOpenDBRequestEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const IDBOpenDBRequest: {
  readonly prototype: IDBOpenDBRequest;
  new (): IDBOpenDBRequest;
};

interface IDBRequestEventMap {
  readonly error: Event;
  readonly success: Event;
}

/** The request object does not initially contain any information about the result of the operation, but once information becomes available, an event is fired on the request, and the information becomes available through the properties of the IDBRequest instance. */
interface IDBRequest<T = unknown> extends EventTarget {
  /** When a request is completed, returns the error (a DOMException), or null if the request succeeded. Throws a "InvalidStateError" DOMException if the request is still pending. */
  readonly error: DOMException | null;
  readonly onerror: ((this: IDBRequest<T>, ev: Event) => unknown) | null;
  readonly onsuccess: ((this: IDBRequest<T>, ev: Event) => unknown) | null;
  /** Returns "pending" until a request is complete, then returns "done". */
  readonly readyState: IDBRequestReadyState;
  /** When a request is completed, returns the result, or undefined if the request failed. Throws a "InvalidStateError" DOMException if the request is still pending. */
  readonly result: T;
  /** Returns the IDBObjectStore, IDBIndex, or IDBCursor the request was made against, or null if is was an open request. */
  readonly source: IDBObjectStore | IDBIndex | IDBCursor;
  /** Returns the IDBTransaction the request was made within. If this as an open request, then it returns an upgrade transaction while it is running, or null otherwise. */
  readonly transaction: IDBTransaction | null;
  addEventListener<K extends keyof IDBRequestEventMap>(
    type: K,
    listener: (this: IDBRequest<T>, ev: IDBRequestEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof IDBRequestEventMap>(
    type: K,
    listener: (this: IDBRequest<T>, ev: IDBRequestEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const IDBRequest: {
  readonly prototype: IDBRequest;
  new (): IDBRequest;
};

interface IDBTransactionEventMap {
  readonly abort: Event;
  readonly complete: Event;
  readonly error: Event;
}

interface IDBTransaction extends EventTarget {
  /** Returns the transaction's connection. */
  readonly db: IDBDatabase;
  readonly durability: IDBTransactionDurability;
  /** If the transaction was aborted, returns the error (a DOMException) providing the reason. */
  readonly error: DOMException | null;
  /** Returns the mode the transaction was created with ("readonly" or "readwrite"), or "versionchange" for an upgrade transaction. */
  readonly mode: IDBTransactionMode;
  /** Returns a list of the names of object stores in the transaction's scope. For an upgrade transaction this is all object stores in the database. */
  readonly objectStoreNames: DOMStringList;
  readonly onabort: ((this: IDBTransaction, ev: Event) => unknown) | null;
  readonly oncomplete: ((this: IDBTransaction, ev: Event) => unknown) | null;
  readonly onerror: ((this: IDBTransaction, ev: Event) => unknown) | null;
  /** Aborts the transaction. All pending requests will fail with a "AbortError" DOMException and all changes made to the database will be reverted. */
  abort(): void;
  commit(): void;
  /** Returns an IDBObjectStore in the transaction's scope. */
  objectStore(name: string): IDBObjectStore;
  addEventListener<K extends keyof IDBTransactionEventMap>(
    type: K,
    listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof IDBTransactionEventMap>(
    type: K,
    listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const IDBTransaction: {
  readonly prototype: IDBTransaction;
  new (): IDBTransaction;
};

/** This IndexedDB API interface indicates that the version of the database has changed, as the result of an IDBOpenDBRequest.onupgradeneeded event handler function. */
interface IDBVersionChangeEvent extends Event {
  readonly newVersion: number | null;
  readonly oldVersion: number;
}

declare const IDBVersionChangeEvent: {
  readonly prototype: IDBVersionChangeEvent;
  new (
    type: string,
    eventInitDict?: IDBVersionChangeEventInit
  ): IDBVersionChangeEvent;
};

/** The IIRFilterNode interface of the Web Audio API is a AudioNode processor which implements a general infinite impulse response (IIR)  filter; this type of filter can be used to implement tone control devices and graphic equalizers as well. It lets the parameters of the filter response be specified, so that it can be tuned as needed. */
interface IIRFilterNode extends AudioNode {
  getFrequencyResponse(
    frequencyHz: Float32Array,
    magResponse: Float32Array,
    phaseResponse: Float32Array
  ): void;
}

declare const IIRFilterNode: {
  readonly prototype: IIRFilterNode;
  new (context: BaseAudioContext, options: IIRFilterOptions): IIRFilterNode;
};

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): DOMHighResTimeStamp;
}

declare const IdleDeadline: {
  readonly prototype: IdleDeadline;
  new (): IdleDeadline;
};

interface ImageBitmap {
  /** Returns the intrinsic height of the image, in CSS pixels. */
  readonly height: number;
  /** Returns the intrinsic width of the image, in CSS pixels. */
  readonly width: number;
  /** Releases imageBitmap's underlying bitmap data. */
  close(): void;
}

declare const ImageBitmap: {
  readonly prototype: ImageBitmap;
  new (): ImageBitmap;
};

interface ImageBitmapRenderingContext {
  /** Returns the canvas element that the context is bound to. */
  readonly canvas: HTMLCanvasElement;
  /** Transfers the underlying bitmap data from imageBitmap to context, and the bitmap becomes the contents of the canvas element to which context is bound. */
  transferFromImageBitmap(bitmap: ImageBitmap | null): void;
}

declare const ImageBitmapRenderingContext: {
  readonly prototype: ImageBitmapRenderingContext;
  new (): ImageBitmapRenderingContext;
};

/** The underlying pixel data of an area of a <canvas> element. It is created using the ImageData() constructor or creator methods on the CanvasRenderingContext2D object associated with a canvas: createImageData() and getImageData(). It can also be used to set a part of the canvas by using putImageData(). */
interface ImageData {
  readonly colorSpace: PredefinedColorSpace;
  /** Returns the one-dimensional array containing the data in RGBA order, as integers in the range 0 to 255. */
  readonly data: Uint8ClampedArray;
  /** Returns the actual dimensions of the data in the ImageData object, in pixels. */
  readonly height: number;
  /** Returns the actual dimensions of the data in the ImageData object, in pixels. */
  readonly width: number;
}

declare const ImageData: {
  readonly prototype: ImageData;
  new (sw: number, sh: number, settings?: ImageDataSettings): ImageData;
  new (
    data: Uint8ClampedArray,
    sw: number,
    sh?: number,
    settings?: ImageDataSettings
  ): ImageData;
};

interface InnerHTML {
  readonly innerHTML: string;
}

interface InputDeviceInfo extends MediaDeviceInfo {}

declare const InputDeviceInfo: {
  readonly prototype: InputDeviceInfo;
  new (): InputDeviceInfo;
};

interface InputEvent extends UIEvent {
  readonly data: string | null;
  readonly dataTransfer: DataTransfer | null;
  readonly inputType: string;
  readonly isComposing: boolean;
  getTargetRanges(): readonly StaticRange[];
}

declare const InputEvent: {
  readonly prototype: InputEvent;
  new (type: string, eventInitDict?: InputEventInit): InputEvent;
};

/** provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. */
interface IntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;
  disconnect(): void;
  observe(target: Element): void;
  takeRecords(): readonly IntersectionObserverEntry[];
  unobserve(target: Element): void;
}

declare const IntersectionObserver: {
  readonly prototype: IntersectionObserver;
  new (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver;
};

/** This Intersection Observer API interface describes the intersection between the target element and its root container at a specific moment of transition. */
interface IntersectionObserverEntry {
  readonly boundingClientRect: DOMRectReadOnly;
  readonly intersectionRatio: number;
  readonly intersectionRect: DOMRectReadOnly;
  readonly isIntersecting: boolean;
  readonly rootBounds: DOMRectReadOnly | null;
  readonly target: Element;
  readonly time: DOMHighResTimeStamp;
}

declare const IntersectionObserverEntry: {
  readonly prototype: IntersectionObserverEntry;
  new (
    intersectionObserverEntryInit: IntersectionObserverEntryInit
  ): IntersectionObserverEntry;
};

interface KHR_parallel_shader_compile {
  readonly COMPLETION_STATUS_KHR: GLenum;
}

/** KeyboardEvent objects describe a user interaction with the keyboard; each event describes a single interaction between the user and a key (or combination of a key with modifier keys) on the keyboard. */
interface KeyboardEvent extends UIEvent {
  readonly altKey: boolean;
  /** @deprecated */
  readonly charCode: number;
  readonly code: string;
  readonly ctrlKey: boolean;
  readonly isComposing: boolean;
  readonly key: string;
  /** @deprecated */
  readonly keyCode: number;
  readonly location: number;
  readonly metaKey: boolean;
  readonly repeat: boolean;
  readonly shiftKey: boolean;
  getModifierState(keyArg: string): boolean;
  /** @deprecated */
  initKeyboardEvent(
    typeArg: string,
    bubblesArg?: boolean,
    cancelableArg?: boolean,
    viewArg?: Window | null,
    keyArg?: string,
    locationArg?: number,
    ctrlKey?: boolean,
    altKey?: boolean,
    shiftKey?: boolean,
    metaKey?: boolean
  ): void;
  readonly DOM_KEY_LOCATION_LEFT: number;
  readonly DOM_KEY_LOCATION_NUMPAD: number;
  readonly DOM_KEY_LOCATION_RIGHT: number;
  readonly DOM_KEY_LOCATION_STANDARD: number;
}

declare const KeyboardEvent: {
  readonly prototype: KeyboardEvent;
  new (type: string, eventInitDict?: KeyboardEventInit): KeyboardEvent;
  readonly DOM_KEY_LOCATION_LEFT: number;
  readonly DOM_KEY_LOCATION_NUMPAD: number;
  readonly DOM_KEY_LOCATION_RIGHT: number;
  readonly DOM_KEY_LOCATION_STANDARD: number;
};

interface KeyframeEffect extends AnimationEffect {
  readonly composite: CompositeOperation;
  readonly iterationComposite: IterationCompositeOperation;
  readonly pseudoElement: string | null;
  readonly target: Element | null;
  getKeyframes(): readonly ComputedKeyframe[];
  setKeyframes(
    keyframes: readonly Keyframe[] | PropertyIndexedKeyframes | null
  ): void;
}

declare const KeyframeEffect: {
  readonly prototype: KeyframeEffect;
  new (
    target: Element | null,
    keyframes: readonly Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeEffectOptions
  ): KeyframeEffect;
  new (source: KeyframeEffect): KeyframeEffect;
};

interface LinkStyle {
  readonly sheet: CSSStyleSheet | null;
}

/** The location (URL) of the object it is linked to. Changes done on it are reflected on the object it relates to. Both the Document and Window interface have such a linked Location, accessible via Document.location and Window.location respectively. */
interface Location {
  /** Returns a DOMStringList object listing the origins of the ancestor browsing contexts, from the parent browsing context to the top-level browsing context. */
  readonly ancestorOrigins: DOMStringList;
  /**
   * Returns the Location object's URL's fragment (includes leading "#" if non-empty).
   *
   * Can be set, to navigate to the same URL with a changed fragment (ignores leading "#").
   */
  readonly hash: string;
  /**
   * Returns the Location object's URL's host and port (if different from the default port for the scheme).
   *
   * Can be set, to navigate to the same URL with a changed host and port.
   */
  readonly host: string;
  /**
   * Returns the Location object's URL's host.
   *
   * Can be set, to navigate to the same URL with a changed host.
   */
  readonly hostname: string;
  /**
   * Returns the Location object's URL.
   *
   * Can be set, to navigate to the given URL.
   */
  readonly href: string;
  toString(): string;
  /** Returns the Location object's URL's origin. */
  readonly origin: string;
  /**
   * Returns the Location object's URL's path.
   *
   * Can be set, to navigate to the same URL with a changed path.
   */
  readonly pathname: string;
  /**
   * Returns the Location object's URL's port.
   *
   * Can be set, to navigate to the same URL with a changed port.
   */
  readonly port: string;
  /**
   * Returns the Location object's URL's scheme.
   *
   * Can be set, to navigate to the same URL with a changed scheme.
   */
  readonly protocol: string;
  /**
   * Returns the Location object's URL's query (includes leading "?" if non-empty).
   *
   * Can be set, to navigate to the same URL with a changed query (ignores leading "?").
   */
  readonly search: string;
  /** Navigates to the given URL. */
  assign(url: string | URL): void;
  /** Reloads the current page. */
  reload(): void;
  /** Removes the current page from the session history and navigates to the given URL. */
  replace(url: string | URL): void;
}

declare const Location: {
  readonly prototype: Location;
  new (): Location;
};

/** Available only in secure contexts. */
interface Lock {
  readonly mode: LockMode;
  readonly name: string;
}

declare const Lock: {
  readonly prototype: Lock;
  new (): Lock;
};

/** Available only in secure contexts. */
interface LockManager {
  query(): Promise<LockManagerSnapshot>;
  request(name: string, callback: LockGrantedCallback): Promise<unknown>;
  request(
    name: string,
    options: LockOptions,
    callback: LockGrantedCallback
  ): Promise<unknown>;
}

declare const LockManager: {
  readonly prototype: LockManager;
  new (): LockManager;
};

interface MIDIAccessEventMap {
  readonly statechange: Event;
}

/** Available only in secure contexts. */
interface MIDIAccess extends EventTarget {
  readonly inputs: MIDIInputMap;
  readonly onstatechange: ((this: MIDIAccess, ev: Event) => unknown) | null;
  readonly outputs: MIDIOutputMap;
  readonly sysexEnabled: boolean;
  addEventListener<K extends keyof MIDIAccessEventMap>(
    type: K,
    listener: (this: MIDIAccess, ev: MIDIAccessEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MIDIAccessEventMap>(
    type: K,
    listener: (this: MIDIAccess, ev: MIDIAccessEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MIDIAccess: {
  readonly prototype: MIDIAccess;
  new (): MIDIAccess;
};

/** Available only in secure contexts. */
interface MIDIConnectionEvent extends Event {
  readonly port: MIDIPort;
}

declare const MIDIConnectionEvent: {
  readonly prototype: MIDIConnectionEvent;
  new (
    type: string,
    eventInitDict?: MIDIConnectionEventInit
  ): MIDIConnectionEvent;
};

interface MIDIInputEventMap extends MIDIPortEventMap {
  readonly midimessage: Event;
}

/** Available only in secure contexts. */
interface MIDIInput extends MIDIPort {
  readonly onmidimessage: ((this: MIDIInput, ev: Event) => unknown) | null;
  addEventListener<K extends keyof MIDIInputEventMap>(
    type: K,
    listener: (this: MIDIInput, ev: MIDIInputEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MIDIInputEventMap>(
    type: K,
    listener: (this: MIDIInput, ev: MIDIInputEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MIDIInput: {
  readonly prototype: MIDIInput;
  new (): MIDIInput;
};

/** Available only in secure contexts. */
interface MIDIInputMap {
  forEach(
    callbackfn: (value: MIDIInput, key: string, parent: MIDIInputMap) => void,
    thisArg?: unknown
  ): void;
}

declare const MIDIInputMap: {
  readonly prototype: MIDIInputMap;
  new (): MIDIInputMap;
};

/** Available only in secure contexts. */
interface MIDIMessageEvent extends Event {
  readonly data: Uint8Array;
}

declare const MIDIMessageEvent: {
  readonly prototype: MIDIMessageEvent;
  new (type: string, eventInitDict?: MIDIMessageEventInit): MIDIMessageEvent;
};

/** Available only in secure contexts. */
interface MIDIOutput extends MIDIPort {
  send(data: readonly number[], timestamp?: DOMHighResTimeStamp): void;
  addEventListener<K extends keyof MIDIPortEventMap>(
    type: K,
    listener: (this: MIDIOutput, ev: MIDIPortEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MIDIPortEventMap>(
    type: K,
    listener: (this: MIDIOutput, ev: MIDIPortEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MIDIOutput: {
  readonly prototype: MIDIOutput;
  new (): MIDIOutput;
};

/** Available only in secure contexts. */
interface MIDIOutputMap {
  forEach(
    callbackfn: (value: MIDIOutput, key: string, parent: MIDIOutputMap) => void,
    thisArg?: unknown
  ): void;
}

declare const MIDIOutputMap: {
  readonly prototype: MIDIOutputMap;
  new (): MIDIOutputMap;
};

interface MIDIPortEventMap {
  readonly statechange: Event;
}

/** Available only in secure contexts. */
interface MIDIPort extends EventTarget {
  readonly connection: MIDIPortConnectionState;
  readonly id: string;
  readonly manufacturer: string | null;
  readonly name: string | null;
  readonly onstatechange: ((this: MIDIPort, ev: Event) => unknown) | null;
  readonly state: MIDIPortDeviceState;
  readonly type: MIDIPortType;
  readonly version: string | null;
  close(): Promise<MIDIPort>;
  open(): Promise<MIDIPort>;
  addEventListener<K extends keyof MIDIPortEventMap>(
    type: K,
    listener: (this: MIDIPort, ev: MIDIPortEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MIDIPortEventMap>(
    type: K,
    listener: (this: MIDIPort, ev: MIDIPortEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MIDIPort: {
  readonly prototype: MIDIPort;
  new (): MIDIPort;
};

interface MathMLElementEventMap
  extends ElementEventMap,
    DocumentAndElementEventHandlersEventMap,
    GlobalEventHandlersEventMap {}

interface MathMLElement
  extends Element,
    DocumentAndElementEventHandlers,
    ElementCSSInlineStyle,
    GlobalEventHandlers,
    HTMLOrSVGElement {
  addEventListener<K extends keyof MathMLElementEventMap>(
    type: K,
    listener: (this: MathMLElement, ev: MathMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MathMLElementEventMap>(
    type: K,
    listener: (this: MathMLElement, ev: MathMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MathMLElement: {
  readonly prototype: MathMLElement;
  new (): MathMLElement;
};

interface MediaCapabilities {
  decodingInfo(
    configuration: MediaDecodingConfiguration
  ): Promise<MediaCapabilitiesDecodingInfo>;
  encodingInfo(
    configuration: MediaEncodingConfiguration
  ): Promise<MediaCapabilitiesEncodingInfo>;
}

declare const MediaCapabilities: {
  readonly prototype: MediaCapabilities;
  new (): MediaCapabilities;
};

/**
 * The MediaDevicesInfo interface contains information that describes a single media input or output device.
 * Available only in secure contexts.
 */
interface MediaDeviceInfo {
  readonly deviceId: string;
  readonly groupId: string;
  readonly kind: MediaDeviceKind;
  readonly label: string;
  toJSON(): unknown;
}

declare const MediaDeviceInfo: {
  readonly prototype: MediaDeviceInfo;
  new (): MediaDeviceInfo;
};

interface MediaDevicesEventMap {
  readonly devicechange: Event;
}

/**
 * Provides access to connected media input devices like cameras and microphones, as well as screen sharing. In essence, it lets you obtain access to any hardware source of media data.
 * Available only in secure contexts.
 */
interface MediaDevices extends EventTarget {
  readonly ondevicechange: ((this: MediaDevices, ev: Event) => unknown) | null;
  enumerateDevices(): Promise<readonly MediaDeviceInfo[]>;
  getDisplayMedia(
    constraints?: DisplayMediaStreamConstraints
  ): Promise<MediaStream>;
  getSupportedConstraints(): MediaTrackSupportedConstraints;
  getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  addEventListener<K extends keyof MediaDevicesEventMap>(
    type: K,
    listener: (this: MediaDevices, ev: MediaDevicesEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaDevicesEventMap>(
    type: K,
    listener: (this: MediaDevices, ev: MediaDevicesEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MediaDevices: {
  readonly prototype: MediaDevices;
  new (): MediaDevices;
};

/** A MediaElementSourceNode has no inputs and exactly one output, and is created using the AudioContext.createMediaElementSource method. The amount of channels in the output equals the number of channels of the audio referenced by the HTMLMediaElement used in the creation of the node, or is 1 if the HTMLMediaElement has no audio. */
interface MediaElementAudioSourceNode extends AudioNode {
  readonly mediaElement: HTMLMediaElement;
}

declare const MediaElementAudioSourceNode: {
  readonly prototype: MediaElementAudioSourceNode;
  new (
    context: AudioContext,
    options: MediaElementAudioSourceOptions
  ): MediaElementAudioSourceNode;
};

interface MediaEncryptedEvent extends Event {
  readonly initData: ArrayBuffer | null;
  readonly initDataType: string;
}

declare const MediaEncryptedEvent: {
  readonly prototype: MediaEncryptedEvent;
  new (
    type: string,
    eventInitDict?: MediaEncryptedEventInit
  ): MediaEncryptedEvent;
};

/** An error which occurred while handling media in an HTML media element based on HTMLMediaElement, such as <audio> or <video>. */
interface MediaError {
  readonly code: number;
  readonly message: string;
  readonly MEDIA_ERR_ABORTED: number;
  readonly MEDIA_ERR_DECODE: number;
  readonly MEDIA_ERR_NETWORK: number;
  readonly MEDIA_ERR_SRC_NOT_SUPPORTED: number;
}

declare const MediaError: {
  readonly prototype: MediaError;
  new (): MediaError;
  readonly MEDIA_ERR_ABORTED: number;
  readonly MEDIA_ERR_DECODE: number;
  readonly MEDIA_ERR_NETWORK: number;
  readonly MEDIA_ERR_SRC_NOT_SUPPORTED: number;
};

/**
 * This EncryptedMediaExtensions API interface contains the content and related data when the content decryption module generates a message for the session.
 * Available only in secure contexts.
 */
interface MediaKeyMessageEvent extends Event {
  readonly message: ArrayBuffer;
  readonly messageType: MediaKeyMessageType;
}

declare const MediaKeyMessageEvent: {
  readonly prototype: MediaKeyMessageEvent;
  new (
    type: string,
    eventInitDict: MediaKeyMessageEventInit
  ): MediaKeyMessageEvent;
};

interface MediaKeySessionEventMap {
  readonly keystatuseschange: Event;
  readonly message: MediaKeyMessageEvent;
}

/**
 * This EncryptedMediaExtensions API interface represents a context for message exchange with a content decryption module (CDM).
 * Available only in secure contexts.
 */
interface MediaKeySession extends EventTarget {
  readonly closed: Promise<MediaKeySessionClosedReason>;
  readonly expiration: number;
  readonly keyStatuses: MediaKeyStatusMap;
  readonly onkeystatuseschange:
    | ((this: MediaKeySession, ev: Event) => unknown)
    | null;
  readonly onmessage:
    | ((this: MediaKeySession, ev: MediaKeyMessageEvent) => unknown)
    | null;
  readonly sessionId: string;
  close(): Promise<void>;
  generateRequest(initDataType: string, initData: BufferSource): Promise<void>;
  load(sessionId: string): Promise<boolean>;
  remove(): Promise<void>;
  update(response: BufferSource): Promise<void>;
  addEventListener<K extends keyof MediaKeySessionEventMap>(
    type: K,
    listener: (
      this: MediaKeySession,
      ev: MediaKeySessionEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaKeySessionEventMap>(
    type: K,
    listener: (
      this: MediaKeySession,
      ev: MediaKeySessionEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MediaKeySession: {
  readonly prototype: MediaKeySession;
  new (): MediaKeySession;
};

/**
 * This EncryptedMediaExtensions API interface is a read-only map of media key statuses by key IDs.
 * Available only in secure contexts.
 */
interface MediaKeyStatusMap {
  readonly size: number;
  get(keyId: BufferSource): MediaKeyStatus | undefined;
  has(keyId: BufferSource): boolean;
  forEach(
    callbackfn: (
      value: MediaKeyStatus,
      key: BufferSource,
      parent: MediaKeyStatusMap
    ) => void,
    thisArg?: unknown
  ): void;
}

declare const MediaKeyStatusMap: {
  readonly prototype: MediaKeyStatusMap;
  new (): MediaKeyStatusMap;
};

/**
 * This EncryptedMediaExtensions API interface provides access to a Key System for decryption and/or a content protection provider. You can request an instance of this object using the Navigator.requestMediaKeySystemAccess method.
 * Available only in secure contexts.
 */
interface MediaKeySystemAccess {
  readonly keySystem: string;
  createMediaKeys(): Promise<MediaKeys>;
  getConfiguration(): MediaKeySystemConfiguration;
}

declare const MediaKeySystemAccess: {
  readonly prototype: MediaKeySystemAccess;
  new (): MediaKeySystemAccess;
};

/**
 * This EncryptedMediaExtensions API interface the represents a set of keys that an associated HTMLMediaElement can use for decryption of media data during playback.
 * Available only in secure contexts.
 */
interface MediaKeys {
  createSession(sessionType?: MediaKeySessionType): MediaKeySession;
  setServerCertificate(serverCertificate: BufferSource): Promise<boolean>;
}

declare const MediaKeys: {
  readonly prototype: MediaKeys;
  new (): MediaKeys;
};

interface MediaList {
  readonly length: number;
  readonly mediaText: string;
  toString(): string;
  appendMedium(medium: string): void;
  deleteMedium(medium: string): void;
  item(index: number): string | null;
  readonly [index: number]: string;
}

declare const MediaList: {
  readonly prototype: MediaList;
  new (): MediaList;
};

interface MediaMetadata {
  readonly album: string;
  readonly artist: string;
  readonly artwork: ReadonlyArray<MediaImage>;
  readonly title: string;
}

declare const MediaMetadata: {
  readonly prototype: MediaMetadata;
  new (init?: MediaMetadataInit): MediaMetadata;
};

interface MediaQueryListEventMap {
  readonly change: MediaQueryListEvent;
}

/** Stores information on a media query applied to a document, and handles sending notifications to listeners when the media query state change (i.e. when the media query test starts or stops evaluating to true). */
interface MediaQueryList extends EventTarget {
  readonly matches: boolean;
  readonly media: string;
  readonly onchange:
    | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
    | null;
  /** @deprecated */
  addListener(
    callback:
      | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
      | null
  ): void;
  /** @deprecated */
  removeListener(
    callback:
      | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown)
      | null
  ): void;
  addEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MediaQueryList: {
  readonly prototype: MediaQueryList;
  new (): MediaQueryList;
};

interface MediaQueryListEvent extends Event {
  readonly matches: boolean;
  readonly media: string;
}

declare const MediaQueryListEvent: {
  readonly prototype: MediaQueryListEvent;
  new (
    type: string,
    eventInitDict?: MediaQueryListEventInit
  ): MediaQueryListEvent;
};

interface MediaRecorderEventMap {
  readonly dataavailable: BlobEvent;
  readonly error: MediaRecorderErrorEvent;
  readonly pause: Event;
  readonly resume: Event;
  readonly start: Event;
  readonly stop: Event;
}

interface MediaRecorder extends EventTarget {
  readonly audioBitsPerSecond: number;
  readonly mimeType: string;
  readonly ondataavailable:
    | ((this: MediaRecorder, ev: BlobEvent) => unknown)
    | null;
  readonly onerror:
    | ((this: MediaRecorder, ev: MediaRecorderErrorEvent) => unknown)
    | null;
  readonly onpause: ((this: MediaRecorder, ev: Event) => unknown) | null;
  readonly onresume: ((this: MediaRecorder, ev: Event) => unknown) | null;
  readonly onstart: ((this: MediaRecorder, ev: Event) => unknown) | null;
  readonly onstop: ((this: MediaRecorder, ev: Event) => unknown) | null;
  readonly state: RecordingState;
  readonly stream: MediaStream;
  readonly videoBitsPerSecond: number;
  pause(): void;
  requestData(): void;
  resume(): void;
  start(timeslice?: number): void;
  stop(): void;
  addEventListener<K extends keyof MediaRecorderEventMap>(
    type: K,
    listener: (this: MediaRecorder, ev: MediaRecorderEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaRecorderEventMap>(
    type: K,
    listener: (this: MediaRecorder, ev: MediaRecorderEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MediaRecorder: {
  readonly prototype: MediaRecorder;
  new (stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;
  isTypeSupported(type: string): boolean;
};

interface MediaRecorderErrorEvent extends Event {
  readonly error: DOMException;
}

declare const MediaRecorderErrorEvent: {
  readonly prototype: MediaRecorderErrorEvent;
  new (
    type: string,
    eventInitDict: MediaRecorderErrorEventInit
  ): MediaRecorderErrorEvent;
};

interface MediaSession {
  readonly metadata: MediaMetadata | null;
  readonly playbackState: MediaSessionPlaybackState;
  setActionHandler(
    action: MediaSessionAction,
    handler: MediaSessionActionHandler | null
  ): void;
  setPositionState(state?: MediaPositionState): void;
}

declare const MediaSession: {
  readonly prototype: MediaSession;
  new (): MediaSession;
};

interface MediaSourceEventMap {
  readonly sourceclose: Event;
  readonly sourceended: Event;
  readonly sourceopen: Event;
}

/** This Media Source Extensions API interface represents a source of media data for an HTMLMediaElement object. A MediaSource object can be attached to a HTMLMediaElement to be played in the user agent. */
interface MediaSource extends EventTarget {
  readonly activeSourceBuffers: SourceBufferList;
  readonly duration: number;
  readonly onsourceclose: ((this: MediaSource, ev: Event) => unknown) | null;
  readonly onsourceended: ((this: MediaSource, ev: Event) => unknown) | null;
  readonly onsourceopen: ((this: MediaSource, ev: Event) => unknown) | null;
  readonly readyState: ReadyState;
  readonly sourceBuffers: SourceBufferList;
  addSourceBuffer(type: string): SourceBuffer;
  clearLiveSeekableRange(): void;
  endOfStream(error?: EndOfStreamError): void;
  removeSourceBuffer(sourceBuffer: SourceBuffer): void;
  setLiveSeekableRange(start: number, end: number): void;
  addEventListener<K extends keyof MediaSourceEventMap>(
    type: K,
    listener: (this: MediaSource, ev: MediaSourceEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaSourceEventMap>(
    type: K,
    listener: (this: MediaSource, ev: MediaSourceEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MediaSource: {
  readonly prototype: MediaSource;
  new (): MediaSource;
  isTypeSupported(type: string): boolean;
};

interface MediaStreamEventMap {
  readonly addtrack: MediaStreamTrackEvent;
  readonly removetrack: MediaStreamTrackEvent;
}

/** A stream of media content. A stream consists of several tracks such as video or audio tracks. Each track is specified as an instance of MediaStreamTrack. */
interface MediaStream extends EventTarget {
  readonly active: boolean;
  readonly id: string;
  readonly onaddtrack:
    | ((this: MediaStream, ev: MediaStreamTrackEvent) => unknown)
    | null;
  readonly onremovetrack:
    | ((this: MediaStream, ev: MediaStreamTrackEvent) => unknown)
    | null;
  addTrack(track: MediaStreamTrack): void;
  clone(): MediaStream;
  getAudioTracks(): readonly MediaStreamTrack[];
  getTrackById(trackId: string): MediaStreamTrack | null;
  getTracks(): readonly MediaStreamTrack[];
  getVideoTracks(): readonly MediaStreamTrack[];
  removeTrack(track: MediaStreamTrack): void;
  addEventListener<K extends keyof MediaStreamEventMap>(
    type: K,
    listener: (this: MediaStream, ev: MediaStreamEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaStreamEventMap>(
    type: K,
    listener: (this: MediaStream, ev: MediaStreamEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MediaStream: {
  readonly prototype: MediaStream;
  new (): MediaStream;
  new (stream: MediaStream): MediaStream;
  new (tracks: readonly MediaStreamTrack[]): MediaStream;
};

interface MediaStreamAudioDestinationNode extends AudioNode {
  readonly stream: MediaStream;
}

declare const MediaStreamAudioDestinationNode: {
  readonly prototype: MediaStreamAudioDestinationNode;
  new (
    context: AudioContext,
    options?: AudioNodeOptions
  ): MediaStreamAudioDestinationNode;
};

/** A type of AudioNode which operates as an audio source whose media is received from a MediaStream obtained using the WebRTC or Media Capture and Streams APIs. */
interface MediaStreamAudioSourceNode extends AudioNode {
  readonly mediaStream: MediaStream;
}

declare const MediaStreamAudioSourceNode: {
  readonly prototype: MediaStreamAudioSourceNode;
  new (
    context: AudioContext,
    options: MediaStreamAudioSourceOptions
  ): MediaStreamAudioSourceNode;
};

interface MediaStreamTrackEventMap {
  readonly ended: Event;
  readonly mute: Event;
  readonly unmute: Event;
}

/** A single media track within a stream; typically, these are audio or video tracks, but other track types may exist as well. */
interface MediaStreamTrack extends EventTarget {
  readonly contentHint: string;
  readonly enabled: boolean;
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly muted: boolean;
  readonly onended: ((this: MediaStreamTrack, ev: Event) => unknown) | null;
  readonly onmute: ((this: MediaStreamTrack, ev: Event) => unknown) | null;
  readonly onunmute: ((this: MediaStreamTrack, ev: Event) => unknown) | null;
  readonly readyState: MediaStreamTrackState;
  applyConstraints(constraints?: MediaTrackConstraints): Promise<void>;
  clone(): MediaStreamTrack;
  getCapabilities(): MediaTrackCapabilities;
  getConstraints(): MediaTrackConstraints;
  getSettings(): MediaTrackSettings;
  stop(): void;
  addEventListener<K extends keyof MediaStreamTrackEventMap>(
    type: K,
    listener: (
      this: MediaStreamTrack,
      ev: MediaStreamTrackEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaStreamTrackEventMap>(
    type: K,
    listener: (
      this: MediaStreamTrack,
      ev: MediaStreamTrackEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MediaStreamTrack: {
  readonly prototype: MediaStreamTrack;
  new (): MediaStreamTrack;
};

/** Events which indicate that a MediaStream has had tracks added to or removed from the stream through calls to Media Stream API methods. These events are sent to the stream when these changes occur. */
interface MediaStreamTrackEvent extends Event {
  readonly track: MediaStreamTrack;
}

declare const MediaStreamTrackEvent: {
  readonly prototype: MediaStreamTrackEvent;
  new (
    type: string,
    eventInitDict: MediaStreamTrackEventInit
  ): MediaStreamTrackEvent;
};

/** This Channel Messaging API interface allows us to create a new message channel and send data through it via its two MessagePort properties. */
interface MessageChannel {
  /** Returns the first MessagePort object. */
  readonly port1: MessagePort;
  /** Returns the second MessagePort object. */
  readonly port2: MessagePort;
}

declare const MessageChannel: {
  readonly prototype: MessageChannel;
  new (): MessageChannel;
};

/** A message received by a target object. */
interface MessageEvent<T = unknown> extends Event {
  /** Returns the data of the message. */
  readonly data: T;
  /** Returns the last event ID string, for server-sent events. */
  readonly lastEventId: string;
  /** Returns the origin of the message, for server-sent events and cross-document messaging. */
  readonly origin: string;
  /** Returns the MessagePort array sent with the message, for cross-document messaging and channel messaging. */
  readonly ports: ReadonlyArray<MessagePort>;
  /** Returns the WindowProxy of the source window, for cross-document messaging, and the MessagePort being attached, in the connect event fired at SharedWorkerGlobalScope objects. */
  readonly source: MessageEventSource | null;
  /** @deprecated */
  initMessageEvent(
    type: string,
    bubbles?: boolean,
    cancelable?: boolean,
    data?: unknown,
    origin?: string,
    lastEventId?: string,
    source?: MessageEventSource | null,
    ports?: readonly MessagePort[]
  ): void;
}

declare const MessageEvent: {
  readonly prototype: MessageEvent;
  new <T>(type: string, eventInitDict?: MessageEventInit<T>): MessageEvent<T>;
};

interface MessagePortEventMap {
  readonly message: MessageEvent;
  readonly messageerror: MessageEvent;
}

/** This Channel Messaging API interface represents one of the two ports of a MessageChannel, allowing messages to be sent from one port and listening out for them arriving at the other. */
interface MessagePort extends EventTarget {
  readonly onmessage: ((this: MessagePort, ev: MessageEvent) => unknown) | null;
  readonly onmessageerror:
    | ((this: MessagePort, ev: MessageEvent) => unknown)
    | null;
  /** Disconnects the port, so that it is no longer active. */
  close(): void;
  /**
   * Posts a message through the channel. Objects listed in transfer are transferred, not just cloned, meaning that they are no longer usable on the sending side.
   *
   * Throws a "DataCloneError" DOMException if transfer contains duplicate objects or port, or if message could not be cloned.
   */
  postMessage(message: unknown, transfer: readonly Transferable[]): void;
  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
  /** Begins dispatching messages received on the port. */
  start(): void;
  addEventListener<K extends keyof MessagePortEventMap>(
    type: K,
    listener: (this: MessagePort, ev: MessagePortEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MessagePortEventMap>(
    type: K,
    listener: (this: MessagePort, ev: MessagePortEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const MessagePort: {
  readonly prototype: MessagePort;
  new (): MessagePort;
};

/**
 * Provides contains information about a MIME type associated with a particular plugin. NavigatorPlugins.mimeTypes returns an array of this object.
 * @deprecated
 */
interface MimeType {
  /**
   * Returns the MIME type's description.
   * @deprecated
   */
  readonly description: string;
  /**
   * Returns the Plugin object that implements this MIME type.
   * @deprecated
   */
  readonly enabledPlugin: Plugin;
  /**
   * Returns the MIME type's typical file extensions, in a comma-separated list.
   * @deprecated
   */
  readonly suffixes: string;
  /**
   * Returns the MIME type.
   * @deprecated
   */
  readonly type: string;
}

/** @deprecated */
declare const MimeType: {
  readonly prototype: MimeType;
  new (): MimeType;
};

/**
 * Returns an array of MimeType instances, each of which contains information about a supported browser plugins. This object is returned by NavigatorPlugins.mimeTypes.
 * @deprecated
 */
interface MimeTypeArray {
  /** @deprecated */
  readonly length: number;
  /** @deprecated */
  item(index: number): MimeType | null;
  /** @deprecated */
  namedItem(name: string): MimeType | null;
  readonly [index: number]: MimeType;
}

/** @deprecated */
declare const MimeTypeArray: {
  readonly prototype: MimeTypeArray;
  new (): MimeTypeArray;
};

/** Events that occur due to the user interacting with a pointing device (such as a mouse). Common events using this interface include click, dblclick, mouseup, mousedown. */
interface MouseEvent extends UIEvent {
  readonly altKey: boolean;
  readonly button: number;
  readonly buttons: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly movementX: number;
  readonly movementY: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly pageX: number;
  readonly pageY: number;
  readonly relatedTarget: EventTarget | null;
  readonly screenX: number;
  readonly screenY: number;
  readonly shiftKey: boolean;
  readonly x: number;
  readonly y: number;
  getModifierState(keyArg: string): boolean;
  /** @deprecated */
  initMouseEvent(
    typeArg: string,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    viewArg: Window,
    detailArg: number,
    screenXArg: number,
    screenYArg: number,
    clientXArg: number,
    clientYArg: number,
    ctrlKeyArg: boolean,
    altKeyArg: boolean,
    shiftKeyArg: boolean,
    metaKeyArg: boolean,
    buttonArg: number,
    relatedTargetArg: EventTarget | null
  ): void;
}

declare const MouseEvent: {
  readonly prototype: MouseEvent;
  new (type: string, eventInitDict?: MouseEventInit): MouseEvent;
};

/**
 * Provides event properties that are specific to modifications to the Document Object Model (DOM) hierarchy and nodes.
 * @deprecated DOM4 [DOM] provides a new mechanism using a MutationObserver interface which addresses the use cases that mutation events solve, but in a more performant manner. Thus, this specification describes mutation events for reference and completeness of legacy behavior, but deprecates the use of the MutationEvent interface.
 */
interface MutationEvent extends Event {
  /** @deprecated */
  readonly attrChange: number;
  /** @deprecated */
  readonly attrName: string;
  /** @deprecated */
  readonly newValue: string;
  /** @deprecated */
  readonly prevValue: string;
  /** @deprecated */
  readonly relatedNode: Node | null;
  /** @deprecated */
  initMutationEvent(
    typeArg: string,
    bubblesArg?: boolean,
    cancelableArg?: boolean,
    relatedNodeArg?: Node | null,
    prevValueArg?: string,
    newValueArg?: string,
    attrNameArg?: string,
    attrChangeArg?: number
  ): void;
  readonly ADDITION: number;
  readonly MODIFICATION: number;
  readonly REMOVAL: number;
}

/** @deprecated */
declare const MutationEvent: {
  readonly prototype: MutationEvent;
  new (): MutationEvent;
  readonly ADDITION: number;
  readonly MODIFICATION: number;
  readonly REMOVAL: number;
};

/** Provides the ability to watch for changes being made to the DOM tree. It is designed as a replacement for the older Mutation Events feature which was part of the DOM3 Events specification. */
interface MutationObserver {
  /** Stops observer from observing any mutations. Until the observe() method is used again, observer's callback will not be invoked. */
  disconnect(): void;
  /**
   * Instructs the user agent to observe a given target (a node) and report any mutations based on the criteria given by options (an object).
   *
   * The options argument allows for setting mutation observation options via object members.
   */
  observe(target: Node, options?: MutationObserverInit): void;
  /** Empties the record queue and returns what was in there. */
  takeRecords(): readonly MutationRecord[];
}

declare const MutationObserver: {
  readonly prototype: MutationObserver;
  new (callback: MutationCallback): MutationObserver;
};

/** A MutationRecord represents an individual DOM mutation. It is the object that is passed to MutationObserver's callback. */
interface MutationRecord {
  /** Return the nodes added and removed respectively. */
  readonly addedNodes: NodeList;
  /** Returns the local name of the changed attribute, and null otherwise. */
  readonly attributeName: string | null;
  /** Returns the namespace of the changed attribute, and null otherwise. */
  readonly attributeNamespace: string | null;
  /** Return the previous and next sibling respectively of the added or removed nodes, and null otherwise. */
  readonly nextSibling: Node | null;
  /** The return value depends on type. For "attributes", it is the value of the changed attribute before the change. For "characterData", it is the data of the changed node before the change. For "childList", it is null. */
  readonly oldValue: string | null;
  /** Return the previous and next sibling respectively of the added or removed nodes, and null otherwise. */
  readonly previousSibling: Node | null;
  /** Return the nodes added and removed respectively. */
  readonly removedNodes: NodeList;
  /** Returns the node the mutation affected, depending on the type. For "attributes", it is the element whose attribute changed. For "characterData", it is the CharacterData node. For "childList", it is the node whose children changed. */
  readonly target: Node;
  /** Returns "attributes" if it was an attribute mutation. "characterData" if it was a mutation to a CharacterData node. And "childList" if it was a mutation to the tree of nodes. */
  readonly type: MutationRecordType;
}

declare const MutationRecord: {
  readonly prototype: MutationRecord;
  new (): MutationRecord;
};

/** A collection of Attr objects. Objects inside a NamedNodeMap are not in any particular order, unlike NodeList, although they may be accessed by an index as in an array. */
interface NamedNodeMap {
  readonly length: number;
  getNamedItem(qualifiedName: string): Attr | null;
  getNamedItemNS(namespace: string | null, localName: string): Attr | null;
  item(index: number): Attr | null;
  removeNamedItem(qualifiedName: string): Attr;
  removeNamedItemNS(namespace: string | null, localName: string): Attr;
  setNamedItem(attr: Attr): Attr | null;
  setNamedItemNS(attr: Attr): Attr | null;
  readonly [index: number]: Attr;
}

declare const NamedNodeMap: {
  readonly prototype: NamedNodeMap;
  new (): NamedNodeMap;
};

/** Available only in secure contexts. */
interface NavigationPreloadManager {
  disable(): Promise<void>;
  enable(): Promise<void>;
  getState(): Promise<NavigationPreloadState>;
  setHeaderValue(value: string): Promise<void>;
}

declare const NavigationPreloadManager: {
  readonly prototype: NavigationPreloadManager;
  new (): NavigationPreloadManager;
};

/** The state and the identity of the user agent. It allows scripts to query it and to register themselves to carry on some activities. */
interface Navigator
  extends NavigatorAutomationInformation,
    NavigatorConcurrentHardware,
    NavigatorContentUtils,
    NavigatorCookies,
    NavigatorID,
    NavigatorLanguage,
    NavigatorLocks,
    NavigatorNetworkInformation,
    NavigatorOnLine,
    NavigatorPlugins,
    NavigatorStorage {
  /** Available only in secure contexts. */
  readonly clipboard: Clipboard;
  /** Available only in secure contexts. */
  readonly credentials: CredentialsContainer;
  readonly doNotTrack: string | null;
  readonly geolocation: Geolocation;
  readonly maxTouchPoints: number;
  readonly mediaCapabilities: MediaCapabilities;
  /** Available only in secure contexts. */
  readonly mediaDevices: MediaDevices;
  readonly mediaSession: MediaSession;
  readonly permissions: Permissions;
  /** Available only in secure contexts. */
  readonly serviceWorker: ServiceWorkerContainer;
  /** Available only in secure contexts. */
  canShare(data?: ShareData): boolean;
  getGamepads(): readonly (Gamepad | null)[];
  /** Available only in secure contexts. */
  requestMIDIAccess(options?: MIDIOptions): Promise<MIDIAccess>;
  /** Available only in secure contexts. */
  requestMediaKeySystemAccess(
    keySystem: string,
    supportedConfigurations: readonly MediaKeySystemConfiguration[]
  ): Promise<MediaKeySystemAccess>;
  sendBeacon(url: string | URL, data?: BodyInit | null): boolean;
  /** Available only in secure contexts. */
  share(data?: ShareData): Promise<void>;
  vibrate(pattern: VibratePattern): boolean;
}

declare const Navigator: {
  readonly prototype: Navigator;
  new (): Navigator;
};

interface NavigatorAutomationInformation {
  readonly webdriver: boolean;
}

interface NavigatorConcurrentHardware {
  readonly hardwareConcurrency: number;
}

interface NavigatorContentUtils {
  /** Available only in secure contexts. */
  registerProtocolHandler(scheme: string, url: string | URL): void;
}

interface NavigatorCookies {
  readonly cookieEnabled: boolean;
}

interface NavigatorID {
  /** @deprecated */
  readonly appCodeName: string;
  /** @deprecated */
  readonly appName: string;
  /** @deprecated */
  readonly appVersion: string;
  /** @deprecated */
  readonly platform: string;
  /** @deprecated */
  readonly product: string;
  /** @deprecated */
  readonly productSub: string;
  readonly userAgent: string;
  readonly vendor: string;
  /** @deprecated */
  readonly vendorSub: string;
}

interface NavigatorLanguage {
  readonly language: string;
  readonly languages: ReadonlyArray<string>;
}

/** Available only in secure contexts. */
interface NavigatorLocks {
  readonly locks: LockManager;
}

interface NavigatorNetworkInformation {
  readonly connection: NetworkInformation;
}

interface NavigatorOnLine {
  readonly onLine: boolean;
}

interface NavigatorPlugins {
  /** @deprecated */
  readonly mimeTypes: MimeTypeArray;
  readonly pdfViewerEnabled: boolean;
  /** @deprecated */
  readonly plugins: PluginArray;
  /** @deprecated */
  javaEnabled(): boolean;
}

/** Available only in secure contexts. */
interface NavigatorStorage {
  readonly storage: StorageManager;
}

interface NetworkInformation extends EventTarget {
  readonly type: ConnectionType;
}

declare const NetworkInformation: {
  readonly prototype: NetworkInformation;
  new (): NetworkInformation;
};

/** Node is an interface from which a number of DOM API object types inherit. It allows those types to be treated similarly; for example, inheriting the same set of methods, or being tested in the same way. */
interface Node extends EventTarget {
  /** Returns node's node document's document base URL. */
  readonly baseURI: string;
  /** Returns the children. */
  readonly childNodes: NodeListOf<ChildNode>;
  /** Returns the first child. */
  readonly firstChild: ChildNode | null;
  /** Returns true if node is connected and false otherwise. */
  readonly isConnected: boolean;
  /** Returns the last child. */
  readonly lastChild: ChildNode | null;
  /** Returns the next sibling. */
  readonly nextSibling: ChildNode | null;
  /** Returns a string appropriate for the type of node. */
  readonly nodeName: string;
  /** Returns the type of node. */
  readonly nodeType: number;
  readonly nodeValue: string | null;
  /** Returns the node document. Returns null for documents. */
  readonly ownerDocument: Document | null;
  /** Returns the parent element. */
  readonly parentElement: HTMLElement | null;
  /** Returns the parent. */
  readonly parentNode: ParentNode | null;
  /** Returns the previous sibling. */
  readonly previousSibling: ChildNode | null;
  readonly textContent: string | null;
  appendChild<T extends Node>(node: T): T;
  /** Returns a copy of node. If deep is true, the copy also includes the node's descendants. */
  cloneNode(deep?: boolean): Node;
  /** Returns a bitmask indicating the position of other relative to node. */
  compareDocumentPosition(other: Node): number;
  /** Returns true if other is an inclusive descendant of node, and false otherwise. */
  contains(other: Node | null): boolean;
  /** Returns node's root. */
  getRootNode(options?: GetRootNodeOptions): Node;
  /** Returns whether node has children. */
  hasChildNodes(): boolean;
  insertBefore<T extends Node>(node: T, child: Node | null): T;
  isDefaultNamespace(namespace: string | null): boolean;
  /** Returns whether node and otherNode have the same properties. */
  isEqualNode(otherNode: Node | null): boolean;
  isSameNode(otherNode: Node | null): boolean;
  lookupNamespaceURI(prefix: string | null): string | null;
  lookupPrefix(namespace: string | null): string | null;
  /** Removes empty exclusive Text nodes and concatenates the data of remaining contiguous exclusive Text nodes into the first of their nodes. */
  normalize(): void;
  removeChild<T extends Node>(child: T): T;
  replaceChild<T extends Node>(node: Node, child: T): T;
  readonly ATTRIBUTE_NODE: number;
  /** node is a CDATASection node. */
  readonly CDATA_SECTION_NODE: number;
  /** node is a Comment node. */
  readonly COMMENT_NODE: number;
  /** node is a DocumentFragment node. */
  readonly DOCUMENT_FRAGMENT_NODE: number;
  /** node is a document. */
  readonly DOCUMENT_NODE: number;
  /** Set when other is a descendant of node. */
  readonly DOCUMENT_POSITION_CONTAINED_BY: number;
  /** Set when other is an ancestor of node. */
  readonly DOCUMENT_POSITION_CONTAINS: number;
  /** Set when node and other are not in the same tree. */
  readonly DOCUMENT_POSITION_DISCONNECTED: number;
  /** Set when other is following node. */
  readonly DOCUMENT_POSITION_FOLLOWING: number;
  readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
  /** Set when other is preceding node. */
  readonly DOCUMENT_POSITION_PRECEDING: number;
  /** node is a doctype. */
  readonly DOCUMENT_TYPE_NODE: number;
  /** node is an element. */
  readonly ELEMENT_NODE: number;
  readonly ENTITY_NODE: number;
  readonly ENTITY_REFERENCE_NODE: number;
  readonly NOTATION_NODE: number;
  /** node is a ProcessingInstruction node. */
  readonly PROCESSING_INSTRUCTION_NODE: number;
  /** node is a Text node. */
  readonly TEXT_NODE: number;
}

declare const Node: {
  readonly prototype: Node;
  new (): Node;
  readonly ATTRIBUTE_NODE: number;
  /** node is a CDATASection node. */
  readonly CDATA_SECTION_NODE: number;
  /** node is a Comment node. */
  readonly COMMENT_NODE: number;
  /** node is a DocumentFragment node. */
  readonly DOCUMENT_FRAGMENT_NODE: number;
  /** node is a document. */
  readonly DOCUMENT_NODE: number;
  /** Set when other is a descendant of node. */
  readonly DOCUMENT_POSITION_CONTAINED_BY: number;
  /** Set when other is an ancestor of node. */
  readonly DOCUMENT_POSITION_CONTAINS: number;
  /** Set when node and other are not in the same tree. */
  readonly DOCUMENT_POSITION_DISCONNECTED: number;
  /** Set when other is following node. */
  readonly DOCUMENT_POSITION_FOLLOWING: number;
  readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
  /** Set when other is preceding node. */
  readonly DOCUMENT_POSITION_PRECEDING: number;
  /** node is a doctype. */
  readonly DOCUMENT_TYPE_NODE: number;
  /** node is an element. */
  readonly ELEMENT_NODE: number;
  readonly ENTITY_NODE: number;
  readonly ENTITY_REFERENCE_NODE: number;
  readonly NOTATION_NODE: number;
  /** node is a ProcessingInstruction node. */
  readonly PROCESSING_INSTRUCTION_NODE: number;
  /** node is a Text node. */
  readonly TEXT_NODE: number;
};

/** An iterator over the members of a list of the nodes in a subtree of the DOM. The nodes will be returned in document order. */
interface NodeIterator {
  readonly filter: NodeFilter | null;
  readonly pointerBeforeReferenceNode: boolean;
  readonly referenceNode: Node;
  readonly root: Node;
  readonly whatToShow: number;
  /** @deprecated */
  detach(): void;
  nextNode(): Node | null;
  previousNode(): Node | null;
}

declare const NodeIterator: {
  readonly prototype: NodeIterator;
  new (): NodeIterator;
};

/** NodeList objects are collections of nodes, usually returned by properties such as Node.childNodes and methods such as document.querySelectorAll(). */
interface NodeList {
  /** Returns the number of nodes in the collection. */
  readonly length: number;
  /** Returns the node with index index from the collection. The nodes are sorted in tree order. */
  item(index: number): Node | null;
  /**
   * Performs the specified action for each node in an list.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the list.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (value: Node, key: number, parent: NodeList) => void,
    thisArg?: unknown
  ): void;
  readonly [index: number]: Node;
}

declare const NodeList: {
  readonly prototype: NodeList;
  new (): NodeList;
};

interface NodeListOf<TNode extends Node> extends NodeList {
  item(index: number): TNode;
  /**
   * Performs the specified action for each node in an list.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the list.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (value: TNode, key: number, parent: NodeListOf<TNode>) => void,
    thisArg?: unknown
  ): void;
  readonly [index: number]: TNode;
}

interface NonDocumentTypeChildNode {
  /** Returns the first following sibling that is an element, and null otherwise. */
  readonly nextElementSibling: Element | null;
  /** Returns the first preceding sibling that is an element, and null otherwise. */
  readonly previousElementSibling: Element | null;
}

interface NonElementParentNode {
  /** Returns the first element within node's descendants whose ID is elementId. */
  getElementById(elementId: string): Element | null;
}

interface NotificationEventMap {
  readonly click: Event;
  readonly close: Event;
  readonly error: Event;
  readonly show: Event;
}

/** This Notifications API interface is used to configure and display desktop notifications to the user. */
interface Notification extends EventTarget {
  readonly body: string;
  readonly data: unknown;
  readonly dir: NotificationDirection;
  readonly icon: string;
  readonly lang: string;
  readonly onclick: ((this: Notification, ev: Event) => unknown) | null;
  readonly onclose: ((this: Notification, ev: Event) => unknown) | null;
  readonly onerror: ((this: Notification, ev: Event) => unknown) | null;
  readonly onshow: ((this: Notification, ev: Event) => unknown) | null;
  readonly tag: string;
  readonly title: string;
  close(): void;
  addEventListener<K extends keyof NotificationEventMap>(
    type: K,
    listener: (this: Notification, ev: NotificationEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof NotificationEventMap>(
    type: K,
    listener: (this: Notification, ev: NotificationEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const Notification: {
  readonly prototype: Notification;
  new (title: string, options?: NotificationOptions): Notification;
  readonly permission: NotificationPermission;
  requestPermission(
    deprecatedCallback?: NotificationPermissionCallback
  ): Promise<NotificationPermission>;
};

/** The OES_element_index_uint extension is part of the WebGL API and adds support for gl.UNSIGNED_INT types to WebGLRenderingContext.drawElements(). */
interface OES_element_index_uint {}

interface OES_fbo_render_mipmap {}

/** The OES_standard_derivatives extension is part of the WebGL API and adds the GLSL derivative functions dFdx, dFdy, and fwidth. */
interface OES_standard_derivatives {
  readonly FRAGMENT_SHADER_DERIVATIVE_HINT_OES: GLenum;
}

/** The OES_texture_float extension is part of the WebGL API and exposes floating-point pixel types for textures. */
interface OES_texture_float {}

/** The OES_texture_float_linear extension is part of the WebGL API and allows linear filtering with floating-point pixel types for textures. */
interface OES_texture_float_linear {}

/** The OES_texture_half_float extension is part of the WebGL API and adds texture formats with 16- (aka half float) and 32-bit floating-point components. */
interface OES_texture_half_float {
  readonly HALF_FLOAT_OES: GLenum;
}

/** The OES_texture_half_float_linear extension is part of the WebGL API and allows linear filtering with half floating-point pixel types for textures. */
interface OES_texture_half_float_linear {}

interface OES_vertex_array_object {
  bindVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
  createVertexArrayOES(): WebGLVertexArrayObjectOES | null;
  deleteVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
  isVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): GLboolean;
  readonly VERTEX_ARRAY_BINDING_OES: GLenum;
}

interface OVR_multiview2 {
  framebufferTextureMultiviewOVR(
    target: GLenum,
    attachment: GLenum,
    texture: WebGLTexture | null,
    level: GLint,
    baseViewIndex: GLint,
    numViews: GLsizei
  ): void;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_BASE_VIEW_INDEX_OVR: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_NUM_VIEWS_OVR: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_VIEW_TARGETS_OVR: GLenum;
  readonly MAX_VIEWS_OVR: GLenum;
}

/** The Web Audio API OfflineAudioCompletionEvent interface represents events that occur when the processing of an OfflineAudioContext is terminated. The complete event implements this interface. */
interface OfflineAudioCompletionEvent extends Event {
  readonly renderedBuffer: AudioBuffer;
}

declare const OfflineAudioCompletionEvent: {
  readonly prototype: OfflineAudioCompletionEvent;
  new (
    type: string,
    eventInitDict: OfflineAudioCompletionEventInit
  ): OfflineAudioCompletionEvent;
};

interface OfflineAudioContextEventMap extends BaseAudioContextEventMap {
  readonly complete: OfflineAudioCompletionEvent;
}

/** An AudioContext interface representing an audio-processing graph built from linked together AudioNodes. In contrast with a standard AudioContext, an OfflineAudioContext doesn't render the audio to the device hardware; instead, it generates it, as fast as it can, and outputs the result to an AudioBuffer. */
interface OfflineAudioContext extends BaseAudioContext {
  readonly length: number;
  readonly oncomplete:
    | ((this: OfflineAudioContext, ev: OfflineAudioCompletionEvent) => unknown)
    | null;
  resume(): Promise<void>;
  startRendering(): Promise<AudioBuffer>;
  suspend(suspendTime: number): Promise<void>;
  addEventListener<K extends keyof OfflineAudioContextEventMap>(
    type: K,
    listener: (
      this: OfflineAudioContext,
      ev: OfflineAudioContextEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof OfflineAudioContextEventMap>(
    type: K,
    listener: (
      this: OfflineAudioContext,
      ev: OfflineAudioContextEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const OfflineAudioContext: {
  readonly prototype: OfflineAudioContext;
  new (contextOptions: OfflineAudioContextOptions): OfflineAudioContext;
  new (
    numberOfChannels: number,
    length: number,
    sampleRate: number
  ): OfflineAudioContext;
};

/** The OscillatorNode interface represents a periodic waveform, such as a sine wave. It is an AudioScheduledSourceNode audio-processing module that causes a specified frequency of a given wave to be created—in effect, a constant tone. */
interface OscillatorNode extends AudioScheduledSourceNode {
  readonly detune: AudioParam;
  readonly frequency: AudioParam;
  readonly type: OscillatorType;
  setPeriodicWave(periodicWave: PeriodicWave): void;
  addEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(
    type: K,
    listener: (
      this: OscillatorNode,
      ev: AudioScheduledSourceNodeEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AudioScheduledSourceNodeEventMap>(
    type: K,
    listener: (
      this: OscillatorNode,
      ev: AudioScheduledSourceNodeEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const OscillatorNode: {
  readonly prototype: OscillatorNode;
  new (context: BaseAudioContext, options?: OscillatorOptions): OscillatorNode;
};

interface OverconstrainedError extends Error {
  readonly constraint: string;
}

declare const OverconstrainedError: {
  readonly prototype: OverconstrainedError;
  new (constraint: string, message?: string): OverconstrainedError;
};

/** The PageTransitionEvent is fired when a document is being loaded or unloaded. */
interface PageTransitionEvent extends Event {
  /**
   * For the pageshow event, returns false if the page is newly being loaded (and the load event will fire). Otherwise, returns true.
   *
   * For the pagehide event, returns false if the page is going away for the last time. Otherwise, returns true, meaning that (if nothing conspires to make the page unsalvageable) the page might be reused if the user navigates back to this page.
   *
   * Things that can cause the page to be unsalvageable include:
   *
   * The user agent decided to not keep the Document alive in a session history entry after unload
   * Having iframes that are not salvageable
   * Active WebSocket objects
   * Aborting a Document
   */
  readonly persisted: boolean;
}

declare const PageTransitionEvent: {
  readonly prototype: PageTransitionEvent;
  new (
    type: string,
    eventInitDict?: PageTransitionEventInit
  ): PageTransitionEvent;
};

/** A PannerNode always has exactly one input and one output: the input can be mono or stereo but the output is always stereo (2 channels); you can't have panning effects without at least two audio channels! */
interface PannerNode extends AudioNode {
  readonly coneInnerAngle: number;
  readonly coneOuterAngle: number;
  readonly coneOuterGain: number;
  readonly distanceModel: DistanceModelType;
  readonly maxDistance: number;
  readonly orientationX: AudioParam;
  readonly orientationY: AudioParam;
  readonly orientationZ: AudioParam;
  readonly panningModel: PanningModelType;
  readonly positionX: AudioParam;
  readonly positionY: AudioParam;
  readonly positionZ: AudioParam;
  readonly refDistance: number;
  readonly rolloffFactor: number;
  /** @deprecated */
  setOrientation(x: number, y: number, z: number): void;
  /** @deprecated */
  setPosition(x: number, y: number, z: number): void;
}

declare const PannerNode: {
  readonly prototype: PannerNode;
  new (context: BaseAudioContext, options?: PannerOptions): PannerNode;
};

interface ParentNode extends Node {
  readonly childElementCount: number;
  /** Returns the child elements. */
  readonly children: HTMLCollection;
  /** Returns the first child that is an element, and null otherwise. */
  readonly firstElementChild: Element | null;
  /** Returns the last child that is an element, and null otherwise. */
  readonly lastElementChild: Element | null;
  /**
   * Inserts nodes after the last child of node, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  append(...nodes: readonly (Node | string)[]): void;
  /**
   * Inserts nodes before the first child of node, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  prepend(...nodes: readonly (Node | string)[]): void;
  /** Returns the first element that is a descendant of node that matches selectors. */
  querySelector<K extends keyof HTMLElementTagNameMap>(
    selectors: K
  ): HTMLElementTagNameMap[K] | null;
  querySelector<K extends keyof SVGElementTagNameMap>(
    selectors: K
  ): SVGElementTagNameMap[K] | null;
  querySelector<E extends Element = Element>(selectors: string): E | null;
  /** Returns all element descendants of node that match selectors. */
  querySelectorAll<K extends keyof HTMLElementTagNameMap>(
    selectors: K
  ): NodeListOf<HTMLElementTagNameMap[K]>;
  querySelectorAll<K extends keyof SVGElementTagNameMap>(
    selectors: K
  ): NodeListOf<SVGElementTagNameMap[K]>;
  querySelectorAll<E extends Element = Element>(
    selectors: string
  ): NodeListOf<E>;
  /**
   * Replace all children of node with nodes, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  replaceChildren(...nodes: readonly (Node | string)[]): void;
}

/** This Canvas 2D API interface is used to declare a path that can then be used on a CanvasRenderingContext2D object. The path methods of the CanvasRenderingContext2D interface are also present on this interface, which gives you the convenience of being able to retain and replay your path whenever desired. */
interface Path2D extends CanvasPath {
  /** Adds to the path the path given by the argument. */
  addPath(path: Path2D, transform?: DOMMatrix2DInit): void;
}

declare const Path2D: {
  readonly prototype: Path2D;
  new (path?: Path2D | string): Path2D;
};

/** Available only in secure contexts. */
interface PaymentMethodChangeEvent extends PaymentRequestUpdateEvent {
  readonly methodDetails: unknown;
  readonly methodName: string;
}

declare const PaymentMethodChangeEvent: {
  readonly prototype: PaymentMethodChangeEvent;
  new (
    type: string,
    eventInitDict?: PaymentMethodChangeEventInit
  ): PaymentMethodChangeEvent;
};

interface PaymentRequestEventMap {
  readonly paymentmethodchange: Event;
}

/**
 * This Payment Request API interface is the primary access point into the API, and lets web content and apps accept payments from the end user.
 * Available only in secure contexts.
 */
interface PaymentRequest extends EventTarget {
  readonly id: string;
  readonly onpaymentmethodchange:
    | ((this: PaymentRequest, ev: Event) => unknown)
    | null;
  abort(): Promise<void>;
  canMakePayment(): Promise<boolean>;
  show(
    detailsPromise?: PaymentDetailsUpdate | PromiseLike<PaymentDetailsUpdate>
  ): Promise<PaymentResponse>;
  addEventListener<K extends keyof PaymentRequestEventMap>(
    type: K,
    listener: (this: PaymentRequest, ev: PaymentRequestEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof PaymentRequestEventMap>(
    type: K,
    listener: (this: PaymentRequest, ev: PaymentRequestEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const PaymentRequest: {
  readonly prototype: PaymentRequest;
  new (
    methodData: readonly PaymentMethodData[],
    details: PaymentDetailsInit
  ): PaymentRequest;
};

/**
 * This Payment Request API interface enables a web page to update the details of a PaymentRequest in response to a user action.
 * Available only in secure contexts.
 */
interface PaymentRequestUpdateEvent extends Event {
  updateWith(
    detailsPromise: PaymentDetailsUpdate | PromiseLike<PaymentDetailsUpdate>
  ): void;
}

declare const PaymentRequestUpdateEvent: {
  readonly prototype: PaymentRequestUpdateEvent;
  new (
    type: string,
    eventInitDict?: PaymentRequestUpdateEventInit
  ): PaymentRequestUpdateEvent;
};

/**
 * This Payment Request API interface is returned after a user selects a payment method and approves a payment request.
 * Available only in secure contexts.
 */
interface PaymentResponse extends EventTarget {
  readonly details: unknown;
  readonly methodName: string;
  readonly requestId: string;
  complete(result?: PaymentComplete): Promise<void>;
  retry(errorFields?: PaymentValidationErrors): Promise<void>;
  toJSON(): unknown;
}

declare const PaymentResponse: {
  readonly prototype: PaymentResponse;
  new (): PaymentResponse;
};

interface PerformanceEventMap {
  readonly resourcetimingbufferfull: Event;
}

/** Provides access to performance-related information for the current page. It's part of the High Resolution Time API, but is enhanced by the Performance Timeline API, the Navigation Timing API, the User Timing API, and the Resource Timing API. */
interface Performance extends EventTarget {
  readonly eventCounts: EventCounts;
  /** @deprecated */
  readonly navigation: PerformanceNavigation;
  readonly onresourcetimingbufferfull:
    | ((this: Performance, ev: Event) => unknown)
    | null;
  readonly timeOrigin: DOMHighResTimeStamp;
  /** @deprecated */
  readonly timing: PerformanceTiming;
  clearMarks(markName?: string): void;
  clearMeasures(measureName?: string): void;
  clearResourceTimings(): void;
  getEntries(): PerformanceEntryList;
  getEntriesByName(name: string, type?: string): PerformanceEntryList;
  getEntriesByType(type: string): PerformanceEntryList;
  mark(markName: string, markOptions?: PerformanceMarkOptions): PerformanceMark;
  measure(
    measureName: string,
    startOrMeasureOptions?: string | PerformanceMeasureOptions,
    endMark?: string
  ): PerformanceMeasure;
  now(): DOMHighResTimeStamp;
  setResourceTimingBufferSize(maxSize: number): void;
  toJSON(): unknown;
  addEventListener<K extends keyof PerformanceEventMap>(
    type: K,
    listener: (this: Performance, ev: PerformanceEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof PerformanceEventMap>(
    type: K,
    listener: (this: Performance, ev: PerformanceEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const Performance: {
  readonly prototype: Performance;
  new (): Performance;
};

/** Encapsulates a single performance metric that is part of the performance timeline. A performance entry can be directly created by making a performance mark or measure (for example by calling the mark() method) at an explicit point in an application. Performance entries are also created in indirect ways such as loading a resource (such as an image). */
interface PerformanceEntry {
  readonly duration: DOMHighResTimeStamp;
  readonly entryType: string;
  readonly name: string;
  readonly startTime: DOMHighResTimeStamp;
  toJSON(): unknown;
}

declare const PerformanceEntry: {
  readonly prototype: PerformanceEntry;
  new (): PerformanceEntry;
};

interface PerformanceEventTiming extends PerformanceEntry {
  readonly cancelable: boolean;
  readonly processingEnd: DOMHighResTimeStamp;
  readonly processingStart: DOMHighResTimeStamp;
  readonly target: Node | null;
  toJSON(): unknown;
}

declare const PerformanceEventTiming: {
  readonly prototype: PerformanceEventTiming;
  new (): PerformanceEventTiming;
};

/** PerformanceMark is an abstract interface for PerformanceEntry objects with an entryType of "mark". Entries of this type are created by calling performance.mark() to add a named DOMHighResTimeStamp (the mark) to the browser's performance timeline. */
interface PerformanceMark extends PerformanceEntry {
  readonly detail: unknown;
}

declare const PerformanceMark: {
  readonly prototype: PerformanceMark;
  new (markName: string, markOptions?: PerformanceMarkOptions): PerformanceMark;
};

/** PerformanceMeasure is an abstract interface for PerformanceEntry objects with an entryType of "measure". Entries of this type are created by calling performance.measure() to add a named DOMHighResTimeStamp (the measure) between two marks to the browser's performance timeline. */
interface PerformanceMeasure extends PerformanceEntry {
  readonly detail: unknown;
}

declare const PerformanceMeasure: {
  readonly prototype: PerformanceMeasure;
  new (): PerformanceMeasure;
};

/**
 * The legacy PerformanceNavigation interface represents information about how the navigation to the current document was done.
 * @deprecated This interface is deprecated in the Navigation Timing Level 2 specification. Please use the PerformanceNavigationTiming interface instead.
 */
interface PerformanceNavigation {
  /** @deprecated */
  readonly redirectCount: number;
  /** @deprecated */
  readonly type: number;
  /** @deprecated */
  toJSON(): unknown;
  readonly TYPE_BACK_FORWARD: number;
  readonly TYPE_NAVIGATE: number;
  readonly TYPE_RELOAD: number;
  readonly TYPE_RESERVED: number;
}

/** @deprecated */
declare const PerformanceNavigation: {
  readonly prototype: PerformanceNavigation;
  new (): PerformanceNavigation;
  readonly TYPE_BACK_FORWARD: number;
  readonly TYPE_NAVIGATE: number;
  readonly TYPE_RELOAD: number;
  readonly TYPE_RESERVED: number;
};

/** Provides methods and properties to store and retrieve metrics regarding the browser's document navigation events. For example, this interface can be used to determine how much time it takes to load or unload a document. */
interface PerformanceNavigationTiming extends PerformanceResourceTiming {
  readonly domComplete: DOMHighResTimeStamp;
  readonly domContentLoadedEventEnd: DOMHighResTimeStamp;
  readonly domContentLoadedEventStart: DOMHighResTimeStamp;
  readonly domInteractive: DOMHighResTimeStamp;
  readonly loadEventEnd: DOMHighResTimeStamp;
  readonly loadEventStart: DOMHighResTimeStamp;
  readonly redirectCount: number;
  readonly type: NavigationTimingType;
  readonly unloadEventEnd: DOMHighResTimeStamp;
  readonly unloadEventStart: DOMHighResTimeStamp;
  toJSON(): unknown;
}

declare const PerformanceNavigationTiming: {
  readonly prototype: PerformanceNavigationTiming;
  new (): PerformanceNavigationTiming;
};

interface PerformanceObserver {
  disconnect(): void;
  observe(options?: PerformanceObserverInit): void;
  takeRecords(): PerformanceEntryList;
}

declare const PerformanceObserver: {
  readonly prototype: PerformanceObserver;
  new (callback: PerformanceObserverCallback): PerformanceObserver;
  readonly supportedEntryTypes: ReadonlyArray<string>;
};

interface PerformanceObserverEntryList {
  getEntries(): PerformanceEntryList;
  getEntriesByName(name: string, type?: string): PerformanceEntryList;
  getEntriesByType(type: string): PerformanceEntryList;
}

declare const PerformanceObserverEntryList: {
  readonly prototype: PerformanceObserverEntryList;
  new (): PerformanceObserverEntryList;
};

interface PerformancePaintTiming extends PerformanceEntry {}

declare const PerformancePaintTiming: {
  readonly prototype: PerformancePaintTiming;
  new (): PerformancePaintTiming;
};

/** Enables retrieval and analysis of detailed network timing data regarding the loading of an application's resources. An application can use the timing metrics to determine, for example, the length of time it takes to fetch a specific resource, such as an XMLHttpRequest, <SVG>, image, or script. */
interface PerformanceResourceTiming extends PerformanceEntry {
  readonly connectEnd: DOMHighResTimeStamp;
  readonly connectStart: DOMHighResTimeStamp;
  readonly decodedBodySize: number;
  readonly domainLookupEnd: DOMHighResTimeStamp;
  readonly domainLookupStart: DOMHighResTimeStamp;
  readonly encodedBodySize: number;
  readonly fetchStart: DOMHighResTimeStamp;
  readonly initiatorType: string;
  readonly nextHopProtocol: string;
  readonly redirectEnd: DOMHighResTimeStamp;
  readonly redirectStart: DOMHighResTimeStamp;
  readonly requestStart: DOMHighResTimeStamp;
  readonly responseEnd: DOMHighResTimeStamp;
  readonly responseStart: DOMHighResTimeStamp;
  readonly secureConnectionStart: DOMHighResTimeStamp;
  readonly serverTiming: ReadonlyArray<PerformanceServerTiming>;
  readonly transferSize: number;
  readonly workerStart: DOMHighResTimeStamp;
  toJSON(): unknown;
}

declare const PerformanceResourceTiming: {
  readonly prototype: PerformanceResourceTiming;
  new (): PerformanceResourceTiming;
};

interface PerformanceServerTiming {
  readonly description: string;
  readonly duration: DOMHighResTimeStamp;
  readonly name: string;
  toJSON(): unknown;
}

declare const PerformanceServerTiming: {
  readonly prototype: PerformanceServerTiming;
  new (): PerformanceServerTiming;
};

/**
 * A legacy interface kept for backwards compatibility and contains properties that offer performance timing information for various events which occur during the loading and use of the current page. You get a PerformanceTiming object describing your page using the window.performance.timing property.
 * @deprecated This interface is deprecated in the Navigation Timing Level 2 specification. Please use the PerformanceNavigationTiming interface instead.
 */
interface PerformanceTiming {
  /** @deprecated */
  readonly connectEnd: number;
  /** @deprecated */
  readonly connectStart: number;
  /** @deprecated */
  readonly domComplete: number;
  /** @deprecated */
  readonly domContentLoadedEventEnd: number;
  /** @deprecated */
  readonly domContentLoadedEventStart: number;
  /** @deprecated */
  readonly domInteractive: number;
  /** @deprecated */
  readonly domLoading: number;
  /** @deprecated */
  readonly domainLookupEnd: number;
  /** @deprecated */
  readonly domainLookupStart: number;
  /** @deprecated */
  readonly fetchStart: number;
  /** @deprecated */
  readonly loadEventEnd: number;
  /** @deprecated */
  readonly loadEventStart: number;
  /** @deprecated */
  readonly navigationStart: number;
  /** @deprecated */
  readonly redirectEnd: number;
  /** @deprecated */
  readonly redirectStart: number;
  /** @deprecated */
  readonly requestStart: number;
  /** @deprecated */
  readonly responseEnd: number;
  /** @deprecated */
  readonly responseStart: number;
  /** @deprecated */
  readonly secureConnectionStart: number;
  /** @deprecated */
  readonly unloadEventEnd: number;
  /** @deprecated */
  readonly unloadEventStart: number;
  /** @deprecated */
  toJSON(): unknown;
}

/** @deprecated */
declare const PerformanceTiming: {
  readonly prototype: PerformanceTiming;
  new (): PerformanceTiming;
};

/** PeriodicWave has no inputs or outputs; it is used to define custom oscillators when calling OscillatorNode.setPeriodicWave(). The PeriodicWave itself is created/returned by AudioContext.createPeriodicWave(). */
interface PeriodicWave {}

declare const PeriodicWave: {
  readonly prototype: PeriodicWave;
  new (context: BaseAudioContext, options?: PeriodicWaveOptions): PeriodicWave;
};

interface PermissionStatusEventMap {
  readonly change: Event;
}

interface PermissionStatus extends EventTarget {
  readonly onchange: ((this: PermissionStatus, ev: Event) => unknown) | null;
  readonly state: PermissionState;
  addEventListener<K extends keyof PermissionStatusEventMap>(
    type: K,
    listener: (
      this: PermissionStatus,
      ev: PermissionStatusEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof PermissionStatusEventMap>(
    type: K,
    listener: (
      this: PermissionStatus,
      ev: PermissionStatusEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const PermissionStatus: {
  readonly prototype: PermissionStatus;
  new (): PermissionStatus;
};

interface Permissions {
  query(permissionDesc: PermissionDescriptor): Promise<PermissionStatus>;
}

declare const Permissions: {
  readonly prototype: Permissions;
  new (): Permissions;
};

interface PictureInPictureWindowEventMap {
  readonly resize: Event;
}

interface PictureInPictureWindow extends EventTarget {
  readonly height: number;
  readonly onresize:
    | ((this: PictureInPictureWindow, ev: Event) => unknown)
    | null;
  readonly width: number;
  addEventListener<K extends keyof PictureInPictureWindowEventMap>(
    type: K,
    listener: (
      this: PictureInPictureWindow,
      ev: PictureInPictureWindowEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof PictureInPictureWindowEventMap>(
    type: K,
    listener: (
      this: PictureInPictureWindow,
      ev: PictureInPictureWindowEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const PictureInPictureWindow: {
  readonly prototype: PictureInPictureWindow;
  new (): PictureInPictureWindow;
};

/**
 * Provides information about a browser plugin.
 * @deprecated
 */
interface Plugin {
  /**
   * Returns the plugin's description.
   * @deprecated
   */
  readonly description: string;
  /**
   * Returns the plugin library's filename, if applicable on the current platform.
   * @deprecated
   */
  readonly filename: string;
  /**
   * Returns the number of MIME types, represented by MimeType objects, supported by the plugin.
   * @deprecated
   */
  readonly length: number;
  /**
   * Returns the plugin's name.
   * @deprecated
   */
  readonly name: string;
  /**
   * Returns the specified MimeType object.
   * @deprecated
   */
  item(index: number): MimeType | null;
  /** @deprecated */
  namedItem(name: string): MimeType | null;
  readonly [index: number]: MimeType;
}

/** @deprecated */
declare const Plugin: {
  readonly prototype: Plugin;
  new (): Plugin;
};

/**
 * Used to store a list of Plugin objects describing the available plugins; it's returned by the window.navigator.plugins property. The PluginArray is not a JavaScript array, but has the length property and supports accessing individual items using bracket notation (plugins[2]), as well as via item(index) and namedItem("name") methods.
 * @deprecated
 */
interface PluginArray {
  /** @deprecated */
  readonly length: number;
  /** @deprecated */
  item(index: number): Plugin | null;
  /** @deprecated */
  namedItem(name: string): Plugin | null;
  /** @deprecated */
  refresh(): void;
  readonly [index: number]: Plugin;
}

/** @deprecated */
declare const PluginArray: {
  readonly prototype: PluginArray;
  new (): PluginArray;
};

/** The state of a DOM event produced by a pointer such as the geometry of the contact point, the device type that generated the event, the amount of pressure that was applied on the contact surface, etc. */
interface PointerEvent extends MouseEvent {
  readonly height: number;
  readonly isPrimary: boolean;
  readonly pointerId: number;
  readonly pointerType: string;
  readonly pressure: number;
  readonly tangentialPressure: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly twist: number;
  readonly width: number;
  /** Available only in secure contexts. */
  getCoalescedEvents(): readonly PointerEvent[];
  getPredictedEvents(): readonly PointerEvent[];
}

declare const PointerEvent: {
  readonly prototype: PointerEvent;
  new (type: string, eventInitDict?: PointerEventInit): PointerEvent;
};

/** PopStateEvent is an event handler for the popstate event on the window. */
interface PopStateEvent extends Event {
  /** Returns a copy of the information that was provided to pushState() or replaceState(). */
  readonly state: unknown;
}

declare const PopStateEvent: {
  readonly prototype: PopStateEvent;
  new (type: string, eventInitDict?: PopStateEventInit): PopStateEvent;
};

/** A processing instruction embeds application-specific instructions in XML which can be ignored by other applications that don't recognize them. */
interface ProcessingInstruction extends CharacterData, LinkStyle {
  readonly ownerDocument: Document;
  readonly target: string;
}

declare const ProcessingInstruction: {
  readonly prototype: ProcessingInstruction;
  new (): ProcessingInstruction;
};

/** Events measuring progress of an underlying process, like an HTTP request (for an XMLHttpRequest, or the loading of the underlying resource of an <img>, <audio>, <video>, <style> or <link>). */
interface ProgressEvent<T extends EventTarget = EventTarget> extends Event {
  readonly lengthComputable: boolean;
  readonly loaded: number;
  readonly target: T | null;
  readonly total: number;
}

declare const ProgressEvent: {
  readonly prototype: ProgressEvent;
  new (type: string, eventInitDict?: ProgressEventInit): ProgressEvent;
};

interface PromiseRejectionEvent extends Event {
  readonly promise: Promise<unknown>;
  readonly reason: unknown;
}

declare const PromiseRejectionEvent: {
  readonly prototype: PromiseRejectionEvent;
  new (
    type: string,
    eventInitDict: PromiseRejectionEventInit
  ): PromiseRejectionEvent;
};

/** Available only in secure contexts. */
interface PublicKeyCredential extends Credential {
  readonly rawId: ArrayBuffer;
  readonly response: AuthenticatorResponse;
  getClientExtensionResults(): AuthenticationExtensionsClientOutputs;
}

declare const PublicKeyCredential: {
  readonly prototype: PublicKeyCredential;
  new (): PublicKeyCredential;
  isUserVerifyingPlatformAuthenticatorAvailable(): Promise<boolean>;
};

/**
 * This Push API interface provides a way to receive notifications from third-party servers as well as request URLs for push notifications.
 * Available only in secure contexts.
 */
interface PushManager {
  getSubscription(): Promise<PushSubscription | null>;
  permissionState(
    options?: PushSubscriptionOptionsInit
  ): Promise<PermissionState>;
  subscribe(options?: PushSubscriptionOptionsInit): Promise<PushSubscription>;
}

declare const PushManager: {
  readonly prototype: PushManager;
  new (): PushManager;
  readonly supportedContentEncodings: ReadonlyArray<string>;
};

/**
 * This Push API interface provides a subcription's URL endpoint and allows unsubscription from a push service.
 * Available only in secure contexts.
 */
interface PushSubscription {
  readonly endpoint: string;
  readonly options: PushSubscriptionOptions;
  getKey(name: PushEncryptionKeyName): ArrayBuffer | null;
  toJSON(): PushSubscriptionJSON;
  unsubscribe(): Promise<boolean>;
}

declare const PushSubscription: {
  readonly prototype: PushSubscription;
  new (): PushSubscription;
};

/** Available only in secure contexts. */
interface PushSubscriptionOptions {
  readonly applicationServerKey: ArrayBuffer | null;
}

declare const PushSubscriptionOptions: {
  readonly prototype: PushSubscriptionOptions;
  new (): PushSubscriptionOptions;
};

interface RTCCertificate {
  readonly expires: EpochTimeStamp;
  getFingerprints(): readonly RTCDtlsFingerprint[];
}

declare const RTCCertificate: {
  readonly prototype: RTCCertificate;
  new (): RTCCertificate;
};

interface RTCDTMFSenderEventMap {
  readonly tonechange: RTCDTMFToneChangeEvent;
}

interface RTCDTMFSender extends EventTarget {
  readonly canInsertDTMF: boolean;
  readonly ontonechange:
    | ((this: RTCDTMFSender, ev: RTCDTMFToneChangeEvent) => unknown)
    | null;
  readonly toneBuffer: string;
  insertDTMF(tones: string, duration?: number, interToneGap?: number): void;
  addEventListener<K extends keyof RTCDTMFSenderEventMap>(
    type: K,
    listener: (this: RTCDTMFSender, ev: RTCDTMFSenderEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof RTCDTMFSenderEventMap>(
    type: K,
    listener: (this: RTCDTMFSender, ev: RTCDTMFSenderEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const RTCDTMFSender: {
  readonly prototype: RTCDTMFSender;
  new (): RTCDTMFSender;
};

/** Events sent to indicate that DTMF tones have started or finished playing. This interface is used by the tonechange event. */
interface RTCDTMFToneChangeEvent extends Event {
  readonly tone: string;
}

declare const RTCDTMFToneChangeEvent: {
  readonly prototype: RTCDTMFToneChangeEvent;
  new (
    type: string,
    eventInitDict?: RTCDTMFToneChangeEventInit
  ): RTCDTMFToneChangeEvent;
};

interface RTCDataChannelEventMap {
  readonly bufferedamountlow: Event;
  readonly close: Event;
  readonly closing: Event;
  readonly error: Event;
  readonly message: MessageEvent;
  readonly open: Event;
}

interface RTCDataChannel extends EventTarget {
  readonly binaryType: BinaryType;
  readonly bufferedAmount: number;
  readonly bufferedAmountLowThreshold: number;
  readonly id: number | null;
  readonly label: string;
  readonly maxPacketLifeTime: number | null;
  readonly maxRetransmits: number | null;
  readonly negotiated: boolean;
  readonly onbufferedamountlow:
    | ((this: RTCDataChannel, ev: Event) => unknown)
    | null;
  readonly onclose: ((this: RTCDataChannel, ev: Event) => unknown) | null;
  readonly onclosing: ((this: RTCDataChannel, ev: Event) => unknown) | null;
  readonly onerror: ((this: RTCDataChannel, ev: Event) => unknown) | null;
  readonly onmessage:
    | ((this: RTCDataChannel, ev: MessageEvent) => unknown)
    | null;
  readonly onopen: ((this: RTCDataChannel, ev: Event) => unknown) | null;
  readonly ordered: boolean;
  readonly protocol: string;
  readonly readyState: RTCDataChannelState;
  close(): void;
  send(data: string): void;
  send(data: Blob): void;
  send(data: ArrayBuffer): void;
  send(data: ArrayBufferView): void;
  addEventListener<K extends keyof RTCDataChannelEventMap>(
    type: K,
    listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof RTCDataChannelEventMap>(
    type: K,
    listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const RTCDataChannel: {
  readonly prototype: RTCDataChannel;
  new (): RTCDataChannel;
};

interface RTCDataChannelEvent extends Event {
  readonly channel: RTCDataChannel;
}

declare const RTCDataChannelEvent: {
  readonly prototype: RTCDataChannelEvent;
  new (
    type: string,
    eventInitDict: RTCDataChannelEventInit
  ): RTCDataChannelEvent;
};

interface RTCDtlsTransportEventMap {
  readonly error: Event;
  readonly statechange: Event;
}

interface RTCDtlsTransport extends EventTarget {
  readonly iceTransport: RTCIceTransport;
  readonly onerror: ((this: RTCDtlsTransport, ev: Event) => unknown) | null;
  readonly onstatechange:
    | ((this: RTCDtlsTransport, ev: Event) => unknown)
    | null;
  readonly state: RTCDtlsTransportState;
  getRemoteCertificates(): readonly ArrayBuffer[];
  addEventListener<K extends keyof RTCDtlsTransportEventMap>(
    type: K,
    listener: (
      this: RTCDtlsTransport,
      ev: RTCDtlsTransportEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof RTCDtlsTransportEventMap>(
    type: K,
    listener: (
      this: RTCDtlsTransport,
      ev: RTCDtlsTransportEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const RTCDtlsTransport: {
  readonly prototype: RTCDtlsTransport;
  new (): RTCDtlsTransport;
};

interface RTCEncodedAudioFrame {
  readonly data: ArrayBuffer;
  readonly timestamp: number;
  getMetadata(): RTCEncodedAudioFrameMetadata;
}

declare const RTCEncodedAudioFrame: {
  readonly prototype: RTCEncodedAudioFrame;
  new (): RTCEncodedAudioFrame;
};

interface RTCEncodedVideoFrame {
  readonly data: ArrayBuffer;
  readonly timestamp: number;
  readonly type: RTCEncodedVideoFrameType;
  getMetadata(): RTCEncodedVideoFrameMetadata;
}

declare const RTCEncodedVideoFrame: {
  readonly prototype: RTCEncodedVideoFrame;
  new (): RTCEncodedVideoFrame;
};

interface RTCError extends DOMException {
  readonly errorDetail: RTCErrorDetailType;
  readonly receivedAlert: number | null;
  readonly sctpCauseCode: number | null;
  readonly sdpLineNumber: number | null;
  readonly sentAlert: number | null;
}

declare const RTCError: {
  readonly prototype: RTCError;
  new (init: RTCErrorInit, message?: string): RTCError;
};

interface RTCErrorEvent extends Event {
  readonly error: RTCError;
}

declare const RTCErrorEvent: {
  readonly prototype: RTCErrorEvent;
  new (type: string, eventInitDict: RTCErrorEventInit): RTCErrorEvent;
};

/** The RTCIceCandidate interface—part of the WebRTC API—represents a candidate Internet Connectivity Establishment (ICE) configuration which may be used to establish an RTCPeerConnection. */
interface RTCIceCandidate {
  readonly address: string | null;
  readonly candidate: string;
  readonly component: RTCIceComponent | null;
  readonly foundation: string | null;
  readonly port: number | null;
  readonly priority: number | null;
  readonly protocol: RTCIceProtocol | null;
  readonly relatedAddress: string | null;
  readonly relatedPort: number | null;
  readonly sdpMLineIndex: number | null;
  readonly sdpMid: string | null;
  readonly tcpType: RTCIceTcpCandidateType | null;
  readonly type: RTCIceCandidateType | null;
  readonly usernameFragment: string | null;
  toJSON(): RTCIceCandidateInit;
}

declare const RTCIceCandidate: {
  readonly prototype: RTCIceCandidate;
  new (candidateInitDict?: RTCIceCandidateInit): RTCIceCandidate;
};

interface RTCIceTransportEventMap {
  readonly gatheringstatechange: Event;
  readonly statechange: Event;
}

/** Provides access to information about the ICE transport layer over which the data is being sent and received. */
interface RTCIceTransport extends EventTarget {
  readonly gatheringState: RTCIceGathererState;
  readonly ongatheringstatechange:
    | ((this: RTCIceTransport, ev: Event) => unknown)
    | null;
  readonly onstatechange:
    | ((this: RTCIceTransport, ev: Event) => unknown)
    | null;
  readonly state: RTCIceTransportState;
  addEventListener<K extends keyof RTCIceTransportEventMap>(
    type: K,
    listener: (
      this: RTCIceTransport,
      ev: RTCIceTransportEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof RTCIceTransportEventMap>(
    type: K,
    listener: (
      this: RTCIceTransport,
      ev: RTCIceTransportEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const RTCIceTransport: {
  readonly prototype: RTCIceTransport;
  new (): RTCIceTransport;
};

interface RTCPeerConnectionEventMap {
  readonly connectionstatechange: Event;
  readonly datachannel: RTCDataChannelEvent;
  readonly icecandidate: RTCPeerConnectionIceEvent;
  readonly icecandidateerror: Event;
  readonly iceconnectionstatechange: Event;
  readonly icegatheringstatechange: Event;
  readonly negotiationneeded: Event;
  readonly signalingstatechange: Event;
  readonly track: RTCTrackEvent;
}

/** A WebRTC connection between the local computer and a remote peer. It provides methods to connect to a remote peer, maintain and monitor the connection, and close the connection once it's no longer needed. */
interface RTCPeerConnection extends EventTarget {
  readonly canTrickleIceCandidates: boolean | null;
  readonly connectionState: RTCPeerConnectionState;
  readonly currentLocalDescription: RTCSessionDescription | null;
  readonly currentRemoteDescription: RTCSessionDescription | null;
  readonly iceConnectionState: RTCIceConnectionState;
  readonly iceGatheringState: RTCIceGatheringState;
  readonly localDescription: RTCSessionDescription | null;
  readonly onconnectionstatechange:
    | ((this: RTCPeerConnection, ev: Event) => unknown)
    | null;
  readonly ondatachannel:
    | ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => unknown)
    | null;
  readonly onicecandidate:
    | ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => unknown)
    | null;
  readonly onicecandidateerror:
    | ((this: RTCPeerConnection, ev: Event) => unknown)
    | null;
  readonly oniceconnectionstatechange:
    | ((this: RTCPeerConnection, ev: Event) => unknown)
    | null;
  readonly onicegatheringstatechange:
    | ((this: RTCPeerConnection, ev: Event) => unknown)
    | null;
  readonly onnegotiationneeded:
    | ((this: RTCPeerConnection, ev: Event) => unknown)
    | null;
  readonly onsignalingstatechange:
    | ((this: RTCPeerConnection, ev: Event) => unknown)
    | null;
  readonly ontrack:
    | ((this: RTCPeerConnection, ev: RTCTrackEvent) => unknown)
    | null;
  readonly pendingLocalDescription: RTCSessionDescription | null;
  readonly pendingRemoteDescription: RTCSessionDescription | null;
  readonly remoteDescription: RTCSessionDescription | null;
  readonly sctp: RTCSctpTransport | null;
  readonly signalingState: RTCSignalingState;
  addIceCandidate(candidate?: RTCIceCandidateInit): Promise<void>;
  /** @deprecated */
  addIceCandidate(
    candidate: RTCIceCandidateInit,
    successCallback: VoidFunction,
    failureCallback: RTCPeerConnectionErrorCallback
  ): Promise<void>;
  addTrack(
    track: MediaStreamTrack,
    ...streams: readonly MediaStream[]
  ): RTCRtpSender;
  addTransceiver(
    trackOrKind: MediaStreamTrack | string,
    init?: RTCRtpTransceiverInit
  ): RTCRtpTransceiver;
  close(): void;
  createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>;
  /** @deprecated */
  createAnswer(
    successCallback: RTCSessionDescriptionCallback,
    failureCallback: RTCPeerConnectionErrorCallback
  ): Promise<void>;
  createDataChannel(
    label: string,
    dataChannelDict?: RTCDataChannelInit
  ): RTCDataChannel;
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
  /** @deprecated */
  createOffer(
    successCallback: RTCSessionDescriptionCallback,
    failureCallback: RTCPeerConnectionErrorCallback,
    options?: RTCOfferOptions
  ): Promise<void>;
  getConfiguration(): RTCConfiguration;
  getReceivers(): readonly RTCRtpReceiver[];
  getSenders(): readonly RTCRtpSender[];
  getStats(selector?: MediaStreamTrack | null): Promise<RTCStatsReport>;
  getTransceivers(): readonly RTCRtpTransceiver[];
  removeTrack(sender: RTCRtpSender): void;
  restartIce(): void;
  setConfiguration(configuration?: RTCConfiguration): void;
  setLocalDescription(
    description?: RTCLocalSessionDescriptionInit
  ): Promise<void>;
  /** @deprecated */
  setLocalDescription(
    description: RTCLocalSessionDescriptionInit,
    successCallback: VoidFunction,
    failureCallback: RTCPeerConnectionErrorCallback
  ): Promise<void>;
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  /** @deprecated */
  setRemoteDescription(
    description: RTCSessionDescriptionInit,
    successCallback: VoidFunction,
    failureCallback: RTCPeerConnectionErrorCallback
  ): Promise<void>;
  addEventListener<K extends keyof RTCPeerConnectionEventMap>(
    type: K,
    listener: (
      this: RTCPeerConnection,
      ev: RTCPeerConnectionEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof RTCPeerConnectionEventMap>(
    type: K,
    listener: (
      this: RTCPeerConnection,
      ev: RTCPeerConnectionEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const RTCPeerConnection: {
  readonly prototype: RTCPeerConnection;
  new (configuration?: RTCConfiguration): RTCPeerConnection;
  generateCertificate(
    keygenAlgorithm: AlgorithmIdentifier
  ): Promise<RTCCertificate>;
};

interface RTCPeerConnectionIceErrorEvent extends Event {
  readonly address: string | null;
  readonly errorCode: number;
  readonly errorText: string;
  readonly port: number | null;
  readonly url: string;
}

declare const RTCPeerConnectionIceErrorEvent: {
  readonly prototype: RTCPeerConnectionIceErrorEvent;
  new (
    type: string,
    eventInitDict: RTCPeerConnectionIceErrorEventInit
  ): RTCPeerConnectionIceErrorEvent;
};

/** Events that occurs in relation to ICE candidates with the target, usually an RTCPeerConnection. Only one event is of this type: icecandidate. */
interface RTCPeerConnectionIceEvent extends Event {
  readonly candidate: RTCIceCandidate | null;
}

declare const RTCPeerConnectionIceEvent: {
  readonly prototype: RTCPeerConnectionIceEvent;
  new (
    type: string,
    eventInitDict?: RTCPeerConnectionIceEventInit
  ): RTCPeerConnectionIceEvent;
};

/** This WebRTC API interface manages the reception and decoding of data for a MediaStreamTrack on an RTCPeerConnection. */
interface RTCRtpReceiver {
  readonly track: MediaStreamTrack;
  readonly transport: RTCDtlsTransport | null;
  getContributingSources(): readonly RTCRtpContributingSource[];
  getParameters(): RTCRtpReceiveParameters;
  getStats(): Promise<RTCStatsReport>;
  getSynchronizationSources(): readonly RTCRtpSynchronizationSource[];
}

declare const RTCRtpReceiver: {
  readonly prototype: RTCRtpReceiver;
  new (): RTCRtpReceiver;
  getCapabilities(kind: string): RTCRtpCapabilities | null;
};

/** Provides the ability to control and obtain details about how a particular MediaStreamTrack is encoded and sent to a remote peer. */
interface RTCRtpSender {
  readonly dtmf: RTCDTMFSender | null;
  readonly track: MediaStreamTrack | null;
  readonly transport: RTCDtlsTransport | null;
  getParameters(): RTCRtpSendParameters;
  getStats(): Promise<RTCStatsReport>;
  replaceTrack(withTrack: MediaStreamTrack | null): Promise<void>;
  setParameters(parameters: RTCRtpSendParameters): Promise<void>;
  setStreams(...streams: readonly MediaStream[]): void;
}

declare const RTCRtpSender: {
  readonly prototype: RTCRtpSender;
  new (): RTCRtpSender;
  getCapabilities(kind: string): RTCRtpCapabilities | null;
};

interface RTCRtpTransceiver {
  readonly currentDirection: RTCRtpTransceiverDirection | null;
  readonly direction: RTCRtpTransceiverDirection;
  readonly mid: string | null;
  readonly receiver: RTCRtpReceiver;
  readonly sender: RTCRtpSender;
  setCodecPreferences(codecs: readonly RTCRtpCodecCapability[]): void;
  stop(): void;
}

declare const RTCRtpTransceiver: {
  readonly prototype: RTCRtpTransceiver;
  new (): RTCRtpTransceiver;
};

interface RTCSctpTransportEventMap {
  readonly statechange: Event;
}

interface RTCSctpTransport extends EventTarget {
  readonly maxChannels: number | null;
  readonly maxMessageSize: number;
  readonly onstatechange:
    | ((this: RTCSctpTransport, ev: Event) => unknown)
    | null;
  readonly state: RTCSctpTransportState;
  readonly transport: RTCDtlsTransport;
  addEventListener<K extends keyof RTCSctpTransportEventMap>(
    type: K,
    listener: (
      this: RTCSctpTransport,
      ev: RTCSctpTransportEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof RTCSctpTransportEventMap>(
    type: K,
    listener: (
      this: RTCSctpTransport,
      ev: RTCSctpTransportEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const RTCSctpTransport: {
  readonly prototype: RTCSctpTransport;
  new (): RTCSctpTransport;
};

/** One end of a connection—or potential connection—and how it's configured. Each RTCSessionDescription consists of a description type indicating which part of the offer/answer negotiation process it describes and of the SDP descriptor of the session. */
interface RTCSessionDescription {
  readonly sdp: string;
  readonly type: RTCSdpType;
  toJSON(): unknown;
}

declare const RTCSessionDescription: {
  readonly prototype: RTCSessionDescription;
  new (descriptionInitDict: RTCSessionDescriptionInit): RTCSessionDescription;
};

interface RTCStatsReport {
  forEach(
    callbackfn: (value: unknown, key: string, parent: RTCStatsReport) => void,
    thisArg?: unknown
  ): void;
}

declare const RTCStatsReport: {
  readonly prototype: RTCStatsReport;
  new (): RTCStatsReport;
};

interface RTCTrackEvent extends Event {
  readonly receiver: RTCRtpReceiver;
  readonly streams: ReadonlyArray<MediaStream>;
  readonly track: MediaStreamTrack;
  readonly transceiver: RTCRtpTransceiver;
}

declare const RTCTrackEvent: {
  readonly prototype: RTCTrackEvent;
  new (type: string, eventInitDict: RTCTrackEventInit): RTCTrackEvent;
};

interface RadioNodeList extends NodeList {
  readonly value: string;
}

declare const RadioNodeList: {
  readonly prototype: RadioNodeList;
  new (): RadioNodeList;
};

/** A fragment of a document that can contain nodes and parts of text nodes. */
interface Range extends AbstractRange {
  /** Returns the node, furthest away from the document, that is an ancestor of both range's start node and end node. */
  readonly commonAncestorContainer: Node;
  cloneContents(): DocumentFragment;
  cloneRange(): Range;
  collapse(toStart?: boolean): void;
  compareBoundaryPoints(how: number, sourceRange: Range): number;
  /** Returns −1 if the point is before the range, 0 if the point is in the range, and 1 if the point is after the range. */
  comparePoint(node: Node, offset: number): number;
  createContextualFragment(fragment: string): DocumentFragment;
  deleteContents(): void;
  detach(): void;
  extractContents(): DocumentFragment;
  getBoundingClientRect(): DOMRect;
  getClientRects(): DOMRectList;
  insertNode(node: Node): void;
  /** Returns whether range intersects node. */
  intersectsNode(node: Node): boolean;
  isPointInRange(node: Node, offset: number): boolean;
  selectNode(node: Node): void;
  selectNodeContents(node: Node): void;
  setEnd(node: Node, offset: number): void;
  setEndAfter(node: Node): void;
  setEndBefore(node: Node): void;
  setStart(node: Node, offset: number): void;
  setStartAfter(node: Node): void;
  setStartBefore(node: Node): void;
  surroundContents(newParent: Node): void;
  toString(): string;
  readonly END_TO_END: number;
  readonly END_TO_START: number;
  readonly START_TO_END: number;
  readonly START_TO_START: number;
}

declare const Range: {
  readonly prototype: Range;
  new (): Range;
  readonly END_TO_END: number;
  readonly END_TO_START: number;
  readonly START_TO_END: number;
  readonly START_TO_START: number;
  toString(): string;
};

/** This Streams API interface represents a readable stream of byte data. The Fetch API offers a concrete instance of a ReadableStream through the body property of a Response object. */
interface ReadableStream<R = unknown> {
  readonly locked: boolean;
  cancel(reason?: unknown): Promise<void>;
  getReader(): ReadableStreamDefaultReader<R>;
  pipeThrough<T>(
    transform: ReadableWritablePair<T, R>,
    options?: StreamPipeOptions
  ): ReadableStream<T>;
  pipeTo(
    destination: WritableStream<R>,
    options?: StreamPipeOptions
  ): Promise<void>;
  tee(): readonly [ReadableStream<R>, ReadableStream<R>];
}

declare const ReadableStream: {
  readonly prototype: ReadableStream;
  new <R = unknown>(
    underlyingSource?: UnderlyingSource<R>,
    strategy?: QueuingStrategy<R>
  ): ReadableStream<R>;
};

interface ReadableStreamDefaultController<R = unknown> {
  readonly desiredSize: number | null;
  close(): void;
  enqueue(chunk?: R): void;
  error(e?: unknown): void;
}

declare const ReadableStreamDefaultController: {
  readonly prototype: ReadableStreamDefaultController;
  new (): ReadableStreamDefaultController;
};

interface ReadableStreamDefaultReader<R = unknown>
  extends ReadableStreamGenericReader {
  read(): Promise<ReadableStreamDefaultReadResult<R>>;
  releaseLock(): void;
}

declare const ReadableStreamDefaultReader: {
  readonly prototype: ReadableStreamDefaultReader;
  new <R = unknown>(stream: ReadableStream<R>): ReadableStreamDefaultReader<R>;
};

interface ReadableStreamGenericReader {
  readonly closed: Promise<undefined>;
  cancel(reason?: unknown): Promise<void>;
}

interface RemotePlaybackEventMap {
  readonly connect: Event;
  readonly connecting: Event;
  readonly disconnect: Event;
}

interface RemotePlayback extends EventTarget {
  readonly onconnect: ((this: RemotePlayback, ev: Event) => unknown) | null;
  readonly onconnecting: ((this: RemotePlayback, ev: Event) => unknown) | null;
  readonly ondisconnect: ((this: RemotePlayback, ev: Event) => unknown) | null;
  readonly state: RemotePlaybackState;
  cancelWatchAvailability(id?: number): Promise<void>;
  prompt(): Promise<void>;
  watchAvailability(
    callback: RemotePlaybackAvailabilityCallback
  ): Promise<number>;
  addEventListener<K extends keyof RemotePlaybackEventMap>(
    type: K,
    listener: (this: RemotePlayback, ev: RemotePlaybackEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof RemotePlaybackEventMap>(
    type: K,
    listener: (this: RemotePlayback, ev: RemotePlaybackEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const RemotePlayback: {
  readonly prototype: RemotePlayback;
  new (): RemotePlayback;
};

/** This Fetch API interface represents a resource request. */
interface Request extends Body {
  /** Returns the cache mode associated with request, which is a string indicating how the request will interact with the browser's cache when fetching. */
  readonly cache: RequestCache;
  /** Returns the credentials mode associated with request, which is a string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. */
  readonly credentials: RequestCredentials;
  /** Returns the kind of resource requested by request, e.g., "document" or "script". */
  readonly destination: RequestDestination;
  /** Returns a Headers object consisting of the headers associated with request. Note that headers added in the network layer by the user agent will not be accounted for in this object, e.g., the "Host" header. */
  readonly headers: Headers;
  /** Returns request's subresource integrity metadata, which is a cryptographic hash of the resource being fetched. Its value consists of multiple hashes separated by whitespace. [SRI] */
  readonly integrity: string;
  /** Returns a boolean indicating whether or not request can outlive the global in which it was created. */
  readonly keepalive: boolean;
  /** Returns request's HTTP method, which is "GET" by default. */
  readonly method: string;
  /** Returns the mode associated with request, which is a string indicating whether the request will use CORS, or will be restricted to same-origin URLs. */
  readonly mode: RequestMode;
  /** Returns the redirect mode associated with request, which is a string indicating how redirects for the request will be handled during fetching. A request will follow redirects by default. */
  readonly redirect: RequestRedirect;
  /** Returns the referrer of request. Its value can be a same-origin URL if explicitly set in init, the empty string to indicate no referrer, and "about:client" when defaulting to the global's default. This is used during fetching to determine the value of the `Referer` header of the request being made. */
  readonly referrer: string;
  /** Returns the referrer policy associated with request. This is used during fetching to compute the value of the request's referrer. */
  readonly referrerPolicy: ReferrerPolicy;
  /** Returns the signal associated with request, which is an AbortSignal object indicating whether or not request has been aborted, and its abort event handler. */
  readonly signal: AbortSignal;
  /** Returns the URL of request as a string. */
  readonly url: string;
  clone(): Request;
}

declare const Request: {
  readonly prototype: Request;
  new (input: RequestInfo | URL, init?: RequestInit): Request;
};

interface ResizeObserver {
  disconnect(): void;
  observe(target: Element, options?: ResizeObserverOptions): void;
  unobserve(target: Element): void;
}

declare const ResizeObserver: {
  readonly prototype: ResizeObserver;
  new (callback: ResizeObserverCallback): ResizeObserver;
};

interface ResizeObserverEntry {
  readonly borderBoxSize: ReadonlyArray<ResizeObserverSize>;
  readonly contentBoxSize: ReadonlyArray<ResizeObserverSize>;
  readonly contentRect: DOMRectReadOnly;
  readonly devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>;
  readonly target: Element;
}

declare const ResizeObserverEntry: {
  readonly prototype: ResizeObserverEntry;
  new (): ResizeObserverEntry;
};

interface ResizeObserverSize {
  readonly blockSize: number;
  readonly inlineSize: number;
}

declare const ResizeObserverSize: {
  readonly prototype: ResizeObserverSize;
  new (): ResizeObserverSize;
};

/** This Fetch API interface represents the response to a request. */
interface Response extends Body {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  clone(): Response;
}

declare const Response: {
  readonly prototype: Response;
  new (body?: BodyInit | null, init?: ResponseInit): Response;
  error(): Response;
  redirect(url: string | URL, status?: number): Response;
};

/** Provides access to the properties of <a> element, as well as methods to manipulate them. */
interface SVGAElement extends SVGGraphicsElement, SVGURIReference {
  readonly rel: string;
  readonly relList: DOMTokenList;
  readonly target: SVGAnimatedString;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGAElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGAElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGAElement: {
  readonly prototype: SVGAElement;
  new (): SVGAElement;
};

/** Used to represent a value that can be an <angle> or <number> value. An SVGAngle reflected through the animVal attribute is always read only. */
interface SVGAngle {
  readonly unitType: number;
  readonly value: number;
  readonly valueAsString: string;
  readonly valueInSpecifiedUnits: number;
  convertToSpecifiedUnits(unitType: number): void;
  newValueSpecifiedUnits(unitType: number, valueInSpecifiedUnits: number): void;
  readonly SVG_ANGLETYPE_DEG: number;
  readonly SVG_ANGLETYPE_GRAD: number;
  readonly SVG_ANGLETYPE_RAD: number;
  readonly SVG_ANGLETYPE_UNKNOWN: number;
  readonly SVG_ANGLETYPE_UNSPECIFIED: number;
}

declare const SVGAngle: {
  readonly prototype: SVGAngle;
  new (): SVGAngle;
  readonly SVG_ANGLETYPE_DEG: number;
  readonly SVG_ANGLETYPE_GRAD: number;
  readonly SVG_ANGLETYPE_RAD: number;
  readonly SVG_ANGLETYPE_UNKNOWN: number;
  readonly SVG_ANGLETYPE_UNSPECIFIED: number;
};

interface SVGAnimateElement extends SVGAnimationElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGAnimateElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGAnimateElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGAnimateElement: {
  readonly prototype: SVGAnimateElement;
  new (): SVGAnimateElement;
};

interface SVGAnimateMotionElement extends SVGAnimationElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGAnimateMotionElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGAnimateMotionElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGAnimateMotionElement: {
  readonly prototype: SVGAnimateMotionElement;
  new (): SVGAnimateMotionElement;
};

interface SVGAnimateTransformElement extends SVGAnimationElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGAnimateTransformElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGAnimateTransformElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGAnimateTransformElement: {
  readonly prototype: SVGAnimateTransformElement;
  new (): SVGAnimateTransformElement;
};

/** Used for attributes of basic type <angle> which can be animated. */
interface SVGAnimatedAngle {
  readonly animVal: SVGAngle;
  readonly baseVal: SVGAngle;
}

declare const SVGAnimatedAngle: {
  readonly prototype: SVGAnimatedAngle;
  new (): SVGAnimatedAngle;
};

/** Used for attributes of type boolean which can be animated. */
interface SVGAnimatedBoolean {
  readonly animVal: boolean;
  readonly baseVal: boolean;
}

declare const SVGAnimatedBoolean: {
  readonly prototype: SVGAnimatedBoolean;
  new (): SVGAnimatedBoolean;
};

/** Used for attributes whose value must be a constant from a particular enumeration and which can be animated. */
interface SVGAnimatedEnumeration {
  readonly animVal: number;
  readonly baseVal: number;
}

declare const SVGAnimatedEnumeration: {
  readonly prototype: SVGAnimatedEnumeration;
  new (): SVGAnimatedEnumeration;
};

/** Used for attributes of basic type <integer> which can be animated. */
interface SVGAnimatedInteger {
  readonly animVal: number;
  readonly baseVal: number;
}

declare const SVGAnimatedInteger: {
  readonly prototype: SVGAnimatedInteger;
  new (): SVGAnimatedInteger;
};

/** Used for attributes of basic type <length> which can be animated. */
interface SVGAnimatedLength {
  readonly animVal: SVGLength;
  readonly baseVal: SVGLength;
}

declare const SVGAnimatedLength: {
  readonly prototype: SVGAnimatedLength;
  new (): SVGAnimatedLength;
};

/** Used for attributes of type SVGLengthList which can be animated. */
interface SVGAnimatedLengthList {
  readonly animVal: SVGLengthList;
  readonly baseVal: SVGLengthList;
}

declare const SVGAnimatedLengthList: {
  readonly prototype: SVGAnimatedLengthList;
  new (): SVGAnimatedLengthList;
};

/** Used for attributes of basic type <Number> which can be animated. */
interface SVGAnimatedNumber {
  readonly animVal: number;
  readonly baseVal: number;
}

declare const SVGAnimatedNumber: {
  readonly prototype: SVGAnimatedNumber;
  new (): SVGAnimatedNumber;
};

/** The SVGAnimatedNumber interface is used for attributes which take a list of numbers and which can be animated. */
interface SVGAnimatedNumberList {
  readonly animVal: SVGNumberList;
  readonly baseVal: SVGNumberList;
}

declare const SVGAnimatedNumberList: {
  readonly prototype: SVGAnimatedNumberList;
  new (): SVGAnimatedNumberList;
};

interface SVGAnimatedPoints {
  readonly animatedPoints: SVGPointList;
  readonly points: SVGPointList;
}

/** Used for attributes of type SVGPreserveAspectRatio which can be animated. */
interface SVGAnimatedPreserveAspectRatio {
  readonly animVal: SVGPreserveAspectRatio;
  readonly baseVal: SVGPreserveAspectRatio;
}

declare const SVGAnimatedPreserveAspectRatio: {
  readonly prototype: SVGAnimatedPreserveAspectRatio;
  new (): SVGAnimatedPreserveAspectRatio;
};

/** Used for attributes of basic SVGRect which can be animated. */
interface SVGAnimatedRect {
  readonly animVal: DOMRectReadOnly;
  readonly baseVal: DOMRect;
}

declare const SVGAnimatedRect: {
  readonly prototype: SVGAnimatedRect;
  new (): SVGAnimatedRect;
};

/** The SVGAnimatedString interface represents string attributes which can be animated from each SVG declaration. You need to create SVG attribute before doing anything else, everything should be declared inside this. */
interface SVGAnimatedString {
  readonly animVal: string;
  readonly baseVal: string;
}

declare const SVGAnimatedString: {
  readonly prototype: SVGAnimatedString;
  new (): SVGAnimatedString;
};

/** Used for attributes which take a list of numbers and which can be animated. */
interface SVGAnimatedTransformList {
  readonly animVal: SVGTransformList;
  readonly baseVal: SVGTransformList;
}

declare const SVGAnimatedTransformList: {
  readonly prototype: SVGAnimatedTransformList;
  new (): SVGAnimatedTransformList;
};

interface SVGAnimationElement extends SVGElement, SVGTests {
  readonly targetElement: SVGElement | null;
  beginElement(): void;
  beginElementAt(offset: number): void;
  endElement(): void;
  endElementAt(offset: number): void;
  getCurrentTime(): number;
  getSimpleDuration(): number;
  getStartTime(): number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGAnimationElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGAnimationElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGAnimationElement: {
  readonly prototype: SVGAnimationElement;
  new (): SVGAnimationElement;
};

/** An interface for the <circle> element. The circle element is defined by the cx and cy attributes that denote the coordinates of the centre of the circle. */
interface SVGCircleElement extends SVGGeometryElement {
  readonly cx: SVGAnimatedLength;
  readonly cy: SVGAnimatedLength;
  readonly r: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGCircleElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGCircleElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGCircleElement: {
  readonly prototype: SVGCircleElement;
  new (): SVGCircleElement;
};

/** Provides access to the properties of <clipPath> elements, as well as methods to manipulate them. */
interface SVGClipPathElement extends SVGElement {
  readonly clipPathUnits: SVGAnimatedEnumeration;
  readonly transform: SVGAnimatedTransformList;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGClipPathElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGClipPathElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGClipPathElement: {
  readonly prototype: SVGClipPathElement;
  new (): SVGClipPathElement;
};

/** A base interface used by the component transfer function interfaces. */
interface SVGComponentTransferFunctionElement extends SVGElement {
  readonly amplitude: SVGAnimatedNumber;
  readonly exponent: SVGAnimatedNumber;
  readonly intercept: SVGAnimatedNumber;
  readonly offset: SVGAnimatedNumber;
  readonly slope: SVGAnimatedNumber;
  readonly tableValues: SVGAnimatedNumberList;
  readonly type: SVGAnimatedEnumeration;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_DISCRETE: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_GAMMA: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_IDENTITY: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_LINEAR: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_TABLE: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGComponentTransferFunctionElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGComponentTransferFunctionElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGComponentTransferFunctionElement: {
  readonly prototype: SVGComponentTransferFunctionElement;
  new (): SVGComponentTransferFunctionElement;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_DISCRETE: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_GAMMA: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_IDENTITY: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_LINEAR: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_TABLE: number;
  readonly SVG_FECOMPONENTTRANSFER_TYPE_UNKNOWN: number;
};

/** Corresponds to the <defs> element. */
interface SVGDefsElement extends SVGGraphicsElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGDefsElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGDefsElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGDefsElement: {
  readonly prototype: SVGDefsElement;
  new (): SVGDefsElement;
};

/** Corresponds to the <desc> element. */
interface SVGDescElement extends SVGElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGDescElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGDescElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGDescElement: {
  readonly prototype: SVGDescElement;
  new (): SVGDescElement;
};

interface SVGElementEventMap
  extends ElementEventMap,
    DocumentAndElementEventHandlersEventMap,
    GlobalEventHandlersEventMap {}

/** All of the SVG DOM interfaces that correspond directly to elements in the SVG language derive from the SVGElement interface. */
interface SVGElement
  extends Element,
    DocumentAndElementEventHandlers,
    ElementCSSInlineStyle,
    GlobalEventHandlers,
    HTMLOrSVGElement {
  /** @deprecated */
  readonly className: unknown;
  readonly ownerSVGElement: SVGSVGElement | null;
  readonly viewportElement: SVGElement | null;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGElement: {
  readonly prototype: SVGElement;
  new (): SVGElement;
};

/** Provides access to the properties of <ellipse> elements. */
interface SVGEllipseElement extends SVGGeometryElement {
  readonly cx: SVGAnimatedLength;
  readonly cy: SVGAnimatedLength;
  readonly rx: SVGAnimatedLength;
  readonly ry: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGEllipseElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGEllipseElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGEllipseElement: {
  readonly prototype: SVGEllipseElement;
  new (): SVGEllipseElement;
};

/** Corresponds to the <feBlend> element. */
interface SVGFEBlendElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  readonly in2: SVGAnimatedString;
  readonly mode: SVGAnimatedEnumeration;
  readonly SVG_FEBLEND_MODE_COLOR: number;
  readonly SVG_FEBLEND_MODE_COLOR_BURN: number;
  readonly SVG_FEBLEND_MODE_COLOR_DODGE: number;
  readonly SVG_FEBLEND_MODE_DARKEN: number;
  readonly SVG_FEBLEND_MODE_DIFFERENCE: number;
  readonly SVG_FEBLEND_MODE_EXCLUSION: number;
  readonly SVG_FEBLEND_MODE_HARD_LIGHT: number;
  readonly SVG_FEBLEND_MODE_HUE: number;
  readonly SVG_FEBLEND_MODE_LIGHTEN: number;
  readonly SVG_FEBLEND_MODE_LUMINOSITY: number;
  readonly SVG_FEBLEND_MODE_MULTIPLY: number;
  readonly SVG_FEBLEND_MODE_NORMAL: number;
  readonly SVG_FEBLEND_MODE_OVERLAY: number;
  readonly SVG_FEBLEND_MODE_SATURATION: number;
  readonly SVG_FEBLEND_MODE_SCREEN: number;
  readonly SVG_FEBLEND_MODE_SOFT_LIGHT: number;
  readonly SVG_FEBLEND_MODE_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEBlendElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEBlendElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEBlendElement: {
  readonly prototype: SVGFEBlendElement;
  new (): SVGFEBlendElement;
  readonly SVG_FEBLEND_MODE_COLOR: number;
  readonly SVG_FEBLEND_MODE_COLOR_BURN: number;
  readonly SVG_FEBLEND_MODE_COLOR_DODGE: number;
  readonly SVG_FEBLEND_MODE_DARKEN: number;
  readonly SVG_FEBLEND_MODE_DIFFERENCE: number;
  readonly SVG_FEBLEND_MODE_EXCLUSION: number;
  readonly SVG_FEBLEND_MODE_HARD_LIGHT: number;
  readonly SVG_FEBLEND_MODE_HUE: number;
  readonly SVG_FEBLEND_MODE_LIGHTEN: number;
  readonly SVG_FEBLEND_MODE_LUMINOSITY: number;
  readonly SVG_FEBLEND_MODE_MULTIPLY: number;
  readonly SVG_FEBLEND_MODE_NORMAL: number;
  readonly SVG_FEBLEND_MODE_OVERLAY: number;
  readonly SVG_FEBLEND_MODE_SATURATION: number;
  readonly SVG_FEBLEND_MODE_SCREEN: number;
  readonly SVG_FEBLEND_MODE_SOFT_LIGHT: number;
  readonly SVG_FEBLEND_MODE_UNKNOWN: number;
};

/** Corresponds to the <feColorMatrix> element. */
interface SVGFEColorMatrixElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  readonly type: SVGAnimatedEnumeration;
  readonly values: SVGAnimatedNumberList;
  readonly SVG_FECOLORMATRIX_TYPE_HUEROTATE: number;
  readonly SVG_FECOLORMATRIX_TYPE_LUMINANCETOALPHA: number;
  readonly SVG_FECOLORMATRIX_TYPE_MATRIX: number;
  readonly SVG_FECOLORMATRIX_TYPE_SATURATE: number;
  readonly SVG_FECOLORMATRIX_TYPE_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEColorMatrixElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEColorMatrixElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEColorMatrixElement: {
  readonly prototype: SVGFEColorMatrixElement;
  new (): SVGFEColorMatrixElement;
  readonly SVG_FECOLORMATRIX_TYPE_HUEROTATE: number;
  readonly SVG_FECOLORMATRIX_TYPE_LUMINANCETOALPHA: number;
  readonly SVG_FECOLORMATRIX_TYPE_MATRIX: number;
  readonly SVG_FECOLORMATRIX_TYPE_SATURATE: number;
  readonly SVG_FECOLORMATRIX_TYPE_UNKNOWN: number;
};

/** Corresponds to the <feComponentTransfer> element. */
interface SVGFEComponentTransferElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEComponentTransferElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEComponentTransferElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEComponentTransferElement: {
  readonly prototype: SVGFEComponentTransferElement;
  new (): SVGFEComponentTransferElement;
};

/** Corresponds to the <feComposite> element. */
interface SVGFECompositeElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  readonly in2: SVGAnimatedString;
  readonly k1: SVGAnimatedNumber;
  readonly k2: SVGAnimatedNumber;
  readonly k3: SVGAnimatedNumber;
  readonly k4: SVGAnimatedNumber;
  readonly operator: SVGAnimatedEnumeration;
  readonly SVG_FECOMPOSITE_OPERATOR_ARITHMETIC: number;
  readonly SVG_FECOMPOSITE_OPERATOR_ATOP: number;
  readonly SVG_FECOMPOSITE_OPERATOR_IN: number;
  readonly SVG_FECOMPOSITE_OPERATOR_OUT: number;
  readonly SVG_FECOMPOSITE_OPERATOR_OVER: number;
  readonly SVG_FECOMPOSITE_OPERATOR_UNKNOWN: number;
  readonly SVG_FECOMPOSITE_OPERATOR_XOR: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFECompositeElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFECompositeElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFECompositeElement: {
  readonly prototype: SVGFECompositeElement;
  new (): SVGFECompositeElement;
  readonly SVG_FECOMPOSITE_OPERATOR_ARITHMETIC: number;
  readonly SVG_FECOMPOSITE_OPERATOR_ATOP: number;
  readonly SVG_FECOMPOSITE_OPERATOR_IN: number;
  readonly SVG_FECOMPOSITE_OPERATOR_OUT: number;
  readonly SVG_FECOMPOSITE_OPERATOR_OVER: number;
  readonly SVG_FECOMPOSITE_OPERATOR_UNKNOWN: number;
  readonly SVG_FECOMPOSITE_OPERATOR_XOR: number;
};

/** Corresponds to the <feConvolveMatrix> element. */
interface SVGFEConvolveMatrixElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly bias: SVGAnimatedNumber;
  readonly divisor: SVGAnimatedNumber;
  readonly edgeMode: SVGAnimatedEnumeration;
  readonly in1: SVGAnimatedString;
  readonly kernelMatrix: SVGAnimatedNumberList;
  readonly kernelUnitLengthX: SVGAnimatedNumber;
  readonly kernelUnitLengthY: SVGAnimatedNumber;
  readonly orderX: SVGAnimatedInteger;
  readonly orderY: SVGAnimatedInteger;
  readonly preserveAlpha: SVGAnimatedBoolean;
  readonly targetX: SVGAnimatedInteger;
  readonly targetY: SVGAnimatedInteger;
  readonly SVG_EDGEMODE_DUPLICATE: number;
  readonly SVG_EDGEMODE_NONE: number;
  readonly SVG_EDGEMODE_UNKNOWN: number;
  readonly SVG_EDGEMODE_WRAP: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEConvolveMatrixElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEConvolveMatrixElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEConvolveMatrixElement: {
  readonly prototype: SVGFEConvolveMatrixElement;
  new (): SVGFEConvolveMatrixElement;
  readonly SVG_EDGEMODE_DUPLICATE: number;
  readonly SVG_EDGEMODE_NONE: number;
  readonly SVG_EDGEMODE_UNKNOWN: number;
  readonly SVG_EDGEMODE_WRAP: number;
};

/** Corresponds to the <feDiffuseLighting> element. */
interface SVGFEDiffuseLightingElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly diffuseConstant: SVGAnimatedNumber;
  readonly in1: SVGAnimatedString;
  readonly kernelUnitLengthX: SVGAnimatedNumber;
  readonly kernelUnitLengthY: SVGAnimatedNumber;
  readonly surfaceScale: SVGAnimatedNumber;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEDiffuseLightingElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEDiffuseLightingElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEDiffuseLightingElement: {
  readonly prototype: SVGFEDiffuseLightingElement;
  new (): SVGFEDiffuseLightingElement;
};

/** Corresponds to the <feDisplacementMap> element. */
interface SVGFEDisplacementMapElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  readonly in2: SVGAnimatedString;
  readonly scale: SVGAnimatedNumber;
  readonly xChannelSelector: SVGAnimatedEnumeration;
  readonly yChannelSelector: SVGAnimatedEnumeration;
  readonly SVG_CHANNEL_A: number;
  readonly SVG_CHANNEL_B: number;
  readonly SVG_CHANNEL_G: number;
  readonly SVG_CHANNEL_R: number;
  readonly SVG_CHANNEL_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEDisplacementMapElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEDisplacementMapElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEDisplacementMapElement: {
  readonly prototype: SVGFEDisplacementMapElement;
  new (): SVGFEDisplacementMapElement;
  readonly SVG_CHANNEL_A: number;
  readonly SVG_CHANNEL_B: number;
  readonly SVG_CHANNEL_G: number;
  readonly SVG_CHANNEL_R: number;
  readonly SVG_CHANNEL_UNKNOWN: number;
};

/** Corresponds to the <feDistantLight> element. */
interface SVGFEDistantLightElement extends SVGElement {
  readonly azimuth: SVGAnimatedNumber;
  readonly elevation: SVGAnimatedNumber;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEDistantLightElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEDistantLightElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEDistantLightElement: {
  readonly prototype: SVGFEDistantLightElement;
  new (): SVGFEDistantLightElement;
};

interface SVGFEDropShadowElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly dx: SVGAnimatedNumber;
  readonly dy: SVGAnimatedNumber;
  readonly in1: SVGAnimatedString;
  readonly stdDeviationX: SVGAnimatedNumber;
  readonly stdDeviationY: SVGAnimatedNumber;
  setStdDeviation(stdDeviationX: number, stdDeviationY: number): void;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEDropShadowElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEDropShadowElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEDropShadowElement: {
  readonly prototype: SVGFEDropShadowElement;
  new (): SVGFEDropShadowElement;
};

/** Corresponds to the <feFlood> element. */
interface SVGFEFloodElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFloodElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFloodElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEFloodElement: {
  readonly prototype: SVGFEFloodElement;
  new (): SVGFEFloodElement;
};

/** Corresponds to the <feFuncA> element. */
interface SVGFEFuncAElement extends SVGComponentTransferFunctionElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFuncAElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFuncAElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEFuncAElement: {
  readonly prototype: SVGFEFuncAElement;
  new (): SVGFEFuncAElement;
};

/** Corresponds to the <feFuncB> element. */
interface SVGFEFuncBElement extends SVGComponentTransferFunctionElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFuncBElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFuncBElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEFuncBElement: {
  readonly prototype: SVGFEFuncBElement;
  new (): SVGFEFuncBElement;
};

/** Corresponds to the <feFuncG> element. */
interface SVGFEFuncGElement extends SVGComponentTransferFunctionElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFuncGElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFuncGElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEFuncGElement: {
  readonly prototype: SVGFEFuncGElement;
  new (): SVGFEFuncGElement;
};

/** Corresponds to the <feFuncR> element. */
interface SVGFEFuncRElement extends SVGComponentTransferFunctionElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFuncRElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEFuncRElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEFuncRElement: {
  readonly prototype: SVGFEFuncRElement;
  new (): SVGFEFuncRElement;
};

/** Corresponds to the <feGaussianBlur> element. */
interface SVGFEGaussianBlurElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  readonly stdDeviationX: SVGAnimatedNumber;
  readonly stdDeviationY: SVGAnimatedNumber;
  setStdDeviation(stdDeviationX: number, stdDeviationY: number): void;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEGaussianBlurElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEGaussianBlurElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEGaussianBlurElement: {
  readonly prototype: SVGFEGaussianBlurElement;
  new (): SVGFEGaussianBlurElement;
};

/** Corresponds to the <feImage> element. */
interface SVGFEImageElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes,
    SVGURIReference {
  readonly preserveAspectRatio: SVGAnimatedPreserveAspectRatio;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEImageElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEImageElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEImageElement: {
  readonly prototype: SVGFEImageElement;
  new (): SVGFEImageElement;
};

/** Corresponds to the <feMerge> element. */
interface SVGFEMergeElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEMergeElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEMergeElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEMergeElement: {
  readonly prototype: SVGFEMergeElement;
  new (): SVGFEMergeElement;
};

/** Corresponds to the <feMergeNode> element. */
interface SVGFEMergeNodeElement extends SVGElement {
  readonly in1: SVGAnimatedString;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEMergeNodeElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEMergeNodeElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEMergeNodeElement: {
  readonly prototype: SVGFEMergeNodeElement;
  new (): SVGFEMergeNodeElement;
};

/** Corresponds to the <feMorphology> element. */
interface SVGFEMorphologyElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  readonly operator: SVGAnimatedEnumeration;
  readonly radiusX: SVGAnimatedNumber;
  readonly radiusY: SVGAnimatedNumber;
  readonly SVG_MORPHOLOGY_OPERATOR_DILATE: number;
  readonly SVG_MORPHOLOGY_OPERATOR_ERODE: number;
  readonly SVG_MORPHOLOGY_OPERATOR_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEMorphologyElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEMorphologyElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEMorphologyElement: {
  readonly prototype: SVGFEMorphologyElement;
  new (): SVGFEMorphologyElement;
  readonly SVG_MORPHOLOGY_OPERATOR_DILATE: number;
  readonly SVG_MORPHOLOGY_OPERATOR_ERODE: number;
  readonly SVG_MORPHOLOGY_OPERATOR_UNKNOWN: number;
};

/** Corresponds to the <feOffset> element. */
interface SVGFEOffsetElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly dx: SVGAnimatedNumber;
  readonly dy: SVGAnimatedNumber;
  readonly in1: SVGAnimatedString;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEOffsetElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFEOffsetElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEOffsetElement: {
  readonly prototype: SVGFEOffsetElement;
  new (): SVGFEOffsetElement;
};

/** Corresponds to the <fePointLight> element. */
interface SVGFEPointLightElement extends SVGElement {
  readonly x: SVGAnimatedNumber;
  readonly y: SVGAnimatedNumber;
  readonly z: SVGAnimatedNumber;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEPointLightElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFEPointLightElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFEPointLightElement: {
  readonly prototype: SVGFEPointLightElement;
  new (): SVGFEPointLightElement;
};

/** Corresponds to the <feSpecularLighting> element. */
interface SVGFESpecularLightingElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  readonly kernelUnitLengthX: SVGAnimatedNumber;
  readonly kernelUnitLengthY: SVGAnimatedNumber;
  readonly specularConstant: SVGAnimatedNumber;
  readonly specularExponent: SVGAnimatedNumber;
  readonly surfaceScale: SVGAnimatedNumber;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFESpecularLightingElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFESpecularLightingElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFESpecularLightingElement: {
  readonly prototype: SVGFESpecularLightingElement;
  new (): SVGFESpecularLightingElement;
};

/** Corresponds to the <feSpotLight> element. */
interface SVGFESpotLightElement extends SVGElement {
  readonly limitingConeAngle: SVGAnimatedNumber;
  readonly pointsAtX: SVGAnimatedNumber;
  readonly pointsAtY: SVGAnimatedNumber;
  readonly pointsAtZ: SVGAnimatedNumber;
  readonly specularExponent: SVGAnimatedNumber;
  readonly x: SVGAnimatedNumber;
  readonly y: SVGAnimatedNumber;
  readonly z: SVGAnimatedNumber;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFESpotLightElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFESpotLightElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFESpotLightElement: {
  readonly prototype: SVGFESpotLightElement;
  new (): SVGFESpotLightElement;
};

/** Corresponds to the <feTile> element. */
interface SVGFETileElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly in1: SVGAnimatedString;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFETileElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFETileElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFETileElement: {
  readonly prototype: SVGFETileElement;
  new (): SVGFETileElement;
};

/** Corresponds to the <feTurbulence> element. */
interface SVGFETurbulenceElement
  extends SVGElement,
    SVGFilterPrimitiveStandardAttributes {
  readonly baseFrequencyX: SVGAnimatedNumber;
  readonly baseFrequencyY: SVGAnimatedNumber;
  readonly numOctaves: SVGAnimatedInteger;
  readonly seed: SVGAnimatedNumber;
  readonly stitchTiles: SVGAnimatedEnumeration;
  readonly type: SVGAnimatedEnumeration;
  readonly SVG_STITCHTYPE_NOSTITCH: number;
  readonly SVG_STITCHTYPE_STITCH: number;
  readonly SVG_STITCHTYPE_UNKNOWN: number;
  readonly SVG_TURBULENCE_TYPE_FRACTALNOISE: number;
  readonly SVG_TURBULENCE_TYPE_TURBULENCE: number;
  readonly SVG_TURBULENCE_TYPE_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFETurbulenceElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGFETurbulenceElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFETurbulenceElement: {
  readonly prototype: SVGFETurbulenceElement;
  new (): SVGFETurbulenceElement;
  readonly SVG_STITCHTYPE_NOSTITCH: number;
  readonly SVG_STITCHTYPE_STITCH: number;
  readonly SVG_STITCHTYPE_UNKNOWN: number;
  readonly SVG_TURBULENCE_TYPE_FRACTALNOISE: number;
  readonly SVG_TURBULENCE_TYPE_TURBULENCE: number;
  readonly SVG_TURBULENCE_TYPE_UNKNOWN: number;
};

/** Provides access to the properties of <filter> elements, as well as methods to manipulate them. */
interface SVGFilterElement extends SVGElement, SVGURIReference {
  readonly filterUnits: SVGAnimatedEnumeration;
  readonly height: SVGAnimatedLength;
  readonly primitiveUnits: SVGAnimatedEnumeration;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFilterElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGFilterElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGFilterElement: {
  readonly prototype: SVGFilterElement;
  new (): SVGFilterElement;
};

interface SVGFilterPrimitiveStandardAttributes {
  readonly height: SVGAnimatedLength;
  readonly result: SVGAnimatedString;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
}

interface SVGFitToViewBox {
  readonly preserveAspectRatio: SVGAnimatedPreserveAspectRatio;
  readonly viewBox: SVGAnimatedRect;
}

/** Provides access to the properties of <foreignObject> elements, as well as methods to manipulate them. */
interface SVGForeignObjectElement extends SVGGraphicsElement {
  readonly height: SVGAnimatedLength;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGForeignObjectElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGForeignObjectElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGForeignObjectElement: {
  readonly prototype: SVGForeignObjectElement;
  new (): SVGForeignObjectElement;
};

/** Corresponds to the <g> element. */
interface SVGGElement extends SVGGraphicsElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGGElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGGElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGGElement: {
  readonly prototype: SVGGElement;
  new (): SVGGElement;
};

interface SVGGeometryElement extends SVGGraphicsElement {
  readonly pathLength: SVGAnimatedNumber;
  getPointAtLength(distance: number): DOMPoint;
  getTotalLength(): number;
  isPointInFill(point?: DOMPointInit): boolean;
  isPointInStroke(point?: DOMPointInit): boolean;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGGeometryElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGGeometryElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGGeometryElement: {
  readonly prototype: SVGGeometryElement;
  new (): SVGGeometryElement;
};

/** The SVGGradient interface is a base interface used by SVGLinearGradientElement and SVGRadialGradientElement. */
interface SVGGradientElement extends SVGElement, SVGURIReference {
  readonly gradientTransform: SVGAnimatedTransformList;
  readonly gradientUnits: SVGAnimatedEnumeration;
  readonly spreadMethod: SVGAnimatedEnumeration;
  readonly SVG_SPREADMETHOD_PAD: number;
  readonly SVG_SPREADMETHOD_REFLECT: number;
  readonly SVG_SPREADMETHOD_REPEAT: number;
  readonly SVG_SPREADMETHOD_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGGradientElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGGradientElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGGradientElement: {
  readonly prototype: SVGGradientElement;
  new (): SVGGradientElement;
  readonly SVG_SPREADMETHOD_PAD: number;
  readonly SVG_SPREADMETHOD_REFLECT: number;
  readonly SVG_SPREADMETHOD_REPEAT: number;
  readonly SVG_SPREADMETHOD_UNKNOWN: number;
};

/** SVG elements whose primary purpose is to directly render graphics into a group. */
interface SVGGraphicsElement extends SVGElement, SVGTests {
  readonly transform: SVGAnimatedTransformList;
  getBBox(options?: SVGBoundingBoxOptions): DOMRect;
  getCTM(): DOMMatrix | null;
  getScreenCTM(): DOMMatrix | null;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGGraphicsElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGGraphicsElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGGraphicsElement: {
  readonly prototype: SVGGraphicsElement;
  new (): SVGGraphicsElement;
};

/** Corresponds to the <image> element. */
interface SVGImageElement extends SVGGraphicsElement, SVGURIReference {
  readonly height: SVGAnimatedLength;
  readonly preserveAspectRatio: SVGAnimatedPreserveAspectRatio;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGImageElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGImageElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGImageElement: {
  readonly prototype: SVGImageElement;
  new (): SVGImageElement;
};

/** Correspond to the <length> basic data type. */
interface SVGLength {
  readonly unitType: number;
  readonly value: number;
  readonly valueAsString: string;
  readonly valueInSpecifiedUnits: number;
  convertToSpecifiedUnits(unitType: number): void;
  newValueSpecifiedUnits(unitType: number, valueInSpecifiedUnits: number): void;
  readonly SVG_LENGTHTYPE_CM: number;
  readonly SVG_LENGTHTYPE_EMS: number;
  readonly SVG_LENGTHTYPE_EXS: number;
  readonly SVG_LENGTHTYPE_IN: number;
  readonly SVG_LENGTHTYPE_MM: number;
  readonly SVG_LENGTHTYPE_NUMBER: number;
  readonly SVG_LENGTHTYPE_PC: number;
  readonly SVG_LENGTHTYPE_PERCENTAGE: number;
  readonly SVG_LENGTHTYPE_PT: number;
  readonly SVG_LENGTHTYPE_PX: number;
  readonly SVG_LENGTHTYPE_UNKNOWN: number;
}

declare const SVGLength: {
  readonly prototype: SVGLength;
  new (): SVGLength;
  readonly SVG_LENGTHTYPE_CM: number;
  readonly SVG_LENGTHTYPE_EMS: number;
  readonly SVG_LENGTHTYPE_EXS: number;
  readonly SVG_LENGTHTYPE_IN: number;
  readonly SVG_LENGTHTYPE_MM: number;
  readonly SVG_LENGTHTYPE_NUMBER: number;
  readonly SVG_LENGTHTYPE_PC: number;
  readonly SVG_LENGTHTYPE_PERCENTAGE: number;
  readonly SVG_LENGTHTYPE_PT: number;
  readonly SVG_LENGTHTYPE_PX: number;
  readonly SVG_LENGTHTYPE_UNKNOWN: number;
};

/** The SVGLengthList defines a list of SVGLength objects. */
interface SVGLengthList {
  readonly length: number;
  readonly numberOfItems: number;
  appendItem(newItem: SVGLength): SVGLength;
  clear(): void;
  getItem(index: number): SVGLength;
  initialize(newItem: SVGLength): SVGLength;
  insertItemBefore(newItem: SVGLength, index: number): SVGLength;
  removeItem(index: number): SVGLength;
  replaceItem(newItem: SVGLength, index: number): SVGLength;
  readonly [index: number]: SVGLength;
}

declare const SVGLengthList: {
  readonly prototype: SVGLengthList;
  new (): SVGLengthList;
};

/** Provides access to the properties of <line> elements, as well as methods to manipulate them. */
interface SVGLineElement extends SVGGeometryElement {
  readonly x1: SVGAnimatedLength;
  readonly x2: SVGAnimatedLength;
  readonly y1: SVGAnimatedLength;
  readonly y2: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGLineElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGLineElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGLineElement: {
  readonly prototype: SVGLineElement;
  new (): SVGLineElement;
};

/** Corresponds to the <linearGradient> element. */
interface SVGLinearGradientElement extends SVGGradientElement {
  readonly x1: SVGAnimatedLength;
  readonly x2: SVGAnimatedLength;
  readonly y1: SVGAnimatedLength;
  readonly y2: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGLinearGradientElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGLinearGradientElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGLinearGradientElement: {
  readonly prototype: SVGLinearGradientElement;
  new (): SVGLinearGradientElement;
};

interface SVGMPathElement extends SVGElement, SVGURIReference {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGMPathElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGMPathElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGMPathElement: {
  readonly prototype: SVGMPathElement;
  new (): SVGMPathElement;
};

interface SVGMarkerElement extends SVGElement, SVGFitToViewBox {
  readonly markerHeight: SVGAnimatedLength;
  readonly markerUnits: SVGAnimatedEnumeration;
  readonly markerWidth: SVGAnimatedLength;
  readonly orientAngle: SVGAnimatedAngle;
  readonly orientType: SVGAnimatedEnumeration;
  readonly refX: SVGAnimatedLength;
  readonly refY: SVGAnimatedLength;
  setOrientToAngle(angle: SVGAngle): void;
  setOrientToAuto(): void;
  readonly SVG_MARKERUNITS_STROKEWIDTH: number;
  readonly SVG_MARKERUNITS_UNKNOWN: number;
  readonly SVG_MARKERUNITS_USERSPACEONUSE: number;
  readonly SVG_MARKER_ORIENT_ANGLE: number;
  readonly SVG_MARKER_ORIENT_AUTO: number;
  readonly SVG_MARKER_ORIENT_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGMarkerElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGMarkerElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGMarkerElement: {
  readonly prototype: SVGMarkerElement;
  new (): SVGMarkerElement;
  readonly SVG_MARKERUNITS_STROKEWIDTH: number;
  readonly SVG_MARKERUNITS_UNKNOWN: number;
  readonly SVG_MARKERUNITS_USERSPACEONUSE: number;
  readonly SVG_MARKER_ORIENT_ANGLE: number;
  readonly SVG_MARKER_ORIENT_AUTO: number;
  readonly SVG_MARKER_ORIENT_UNKNOWN: number;
};

/** Provides access to the properties of <mask> elements, as well as methods to manipulate them. */
interface SVGMaskElement extends SVGElement {
  readonly height: SVGAnimatedLength;
  readonly maskContentUnits: SVGAnimatedEnumeration;
  readonly maskUnits: SVGAnimatedEnumeration;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGMaskElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGMaskElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGMaskElement: {
  readonly prototype: SVGMaskElement;
  new (): SVGMaskElement;
};

/** Corresponds to the <metadata> element. */
interface SVGMetadataElement extends SVGElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGMetadataElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGMetadataElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGMetadataElement: {
  readonly prototype: SVGMetadataElement;
  new (): SVGMetadataElement;
};

/** Corresponds to the <number> basic data type. */
interface SVGNumber {
  readonly value: number;
}

declare const SVGNumber: {
  readonly prototype: SVGNumber;
  new (): SVGNumber;
};

/** The SVGNumberList defines a list of SVGNumber objects. */
interface SVGNumberList {
  readonly length: number;
  readonly numberOfItems: number;
  appendItem(newItem: SVGNumber): SVGNumber;
  clear(): void;
  getItem(index: number): SVGNumber;
  initialize(newItem: SVGNumber): SVGNumber;
  insertItemBefore(newItem: SVGNumber, index: number): SVGNumber;
  removeItem(index: number): SVGNumber;
  replaceItem(newItem: SVGNumber, index: number): SVGNumber;
  readonly [index: number]: SVGNumber;
}

declare const SVGNumberList: {
  readonly prototype: SVGNumberList;
  new (): SVGNumberList;
};

/** Corresponds to the <path> element. */
interface SVGPathElement extends SVGGeometryElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGPathElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGPathElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGPathElement: {
  readonly prototype: SVGPathElement;
  new (): SVGPathElement;
};

/** Corresponds to the <pattern> element. */
interface SVGPatternElement
  extends SVGElement,
    SVGFitToViewBox,
    SVGURIReference {
  readonly height: SVGAnimatedLength;
  readonly patternContentUnits: SVGAnimatedEnumeration;
  readonly patternTransform: SVGAnimatedTransformList;
  readonly patternUnits: SVGAnimatedEnumeration;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGPatternElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGPatternElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGPatternElement: {
  readonly prototype: SVGPatternElement;
  new (): SVGPatternElement;
};

interface SVGPointList {
  readonly length: number;
  readonly numberOfItems: number;
  appendItem(newItem: DOMPoint): DOMPoint;
  clear(): void;
  getItem(index: number): DOMPoint;
  initialize(newItem: DOMPoint): DOMPoint;
  insertItemBefore(newItem: DOMPoint, index: number): DOMPoint;
  removeItem(index: number): DOMPoint;
  replaceItem(newItem: DOMPoint, index: number): DOMPoint;
  readonly [index: number]: DOMPoint;
}

declare const SVGPointList: {
  readonly prototype: SVGPointList;
  new (): SVGPointList;
};

/** Provides access to the properties of <polygon> elements, as well as methods to manipulate them. */
interface SVGPolygonElement extends SVGGeometryElement, SVGAnimatedPoints {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGPolygonElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGPolygonElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGPolygonElement: {
  readonly prototype: SVGPolygonElement;
  new (): SVGPolygonElement;
};

/** Provides access to the properties of <polyline> elements, as well as methods to manipulate them. */
interface SVGPolylineElement extends SVGGeometryElement, SVGAnimatedPoints {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGPolylineElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGPolylineElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGPolylineElement: {
  readonly prototype: SVGPolylineElement;
  new (): SVGPolylineElement;
};

/** Corresponds to the preserveAspectRatio attribute, which is available for some of SVG's elements. */
interface SVGPreserveAspectRatio {
  readonly align: number;
  readonly meetOrSlice: number;
  readonly SVG_MEETORSLICE_MEET: number;
  readonly SVG_MEETORSLICE_SLICE: number;
  readonly SVG_MEETORSLICE_UNKNOWN: number;
  readonly SVG_PRESERVEASPECTRATIO_NONE: number;
  readonly SVG_PRESERVEASPECTRATIO_UNKNOWN: number;
  readonly SVG_PRESERVEASPECTRATIO_XMAXYMAX: number;
  readonly SVG_PRESERVEASPECTRATIO_XMAXYMID: number;
  readonly SVG_PRESERVEASPECTRATIO_XMAXYMIN: number;
  readonly SVG_PRESERVEASPECTRATIO_XMIDYMAX: number;
  readonly SVG_PRESERVEASPECTRATIO_XMIDYMID: number;
  readonly SVG_PRESERVEASPECTRATIO_XMIDYMIN: number;
  readonly SVG_PRESERVEASPECTRATIO_XMINYMAX: number;
  readonly SVG_PRESERVEASPECTRATIO_XMINYMID: number;
  readonly SVG_PRESERVEASPECTRATIO_XMINYMIN: number;
}

declare const SVGPreserveAspectRatio: {
  readonly prototype: SVGPreserveAspectRatio;
  new (): SVGPreserveAspectRatio;
  readonly SVG_MEETORSLICE_MEET: number;
  readonly SVG_MEETORSLICE_SLICE: number;
  readonly SVG_MEETORSLICE_UNKNOWN: number;
  readonly SVG_PRESERVEASPECTRATIO_NONE: number;
  readonly SVG_PRESERVEASPECTRATIO_UNKNOWN: number;
  readonly SVG_PRESERVEASPECTRATIO_XMAXYMAX: number;
  readonly SVG_PRESERVEASPECTRATIO_XMAXYMID: number;
  readonly SVG_PRESERVEASPECTRATIO_XMAXYMIN: number;
  readonly SVG_PRESERVEASPECTRATIO_XMIDYMAX: number;
  readonly SVG_PRESERVEASPECTRATIO_XMIDYMID: number;
  readonly SVG_PRESERVEASPECTRATIO_XMIDYMIN: number;
  readonly SVG_PRESERVEASPECTRATIO_XMINYMAX: number;
  readonly SVG_PRESERVEASPECTRATIO_XMINYMID: number;
  readonly SVG_PRESERVEASPECTRATIO_XMINYMIN: number;
};

/** Corresponds to the <RadialGradient> element. */
interface SVGRadialGradientElement extends SVGGradientElement {
  readonly cx: SVGAnimatedLength;
  readonly cy: SVGAnimatedLength;
  readonly fr: SVGAnimatedLength;
  readonly fx: SVGAnimatedLength;
  readonly fy: SVGAnimatedLength;
  readonly r: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGRadialGradientElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGRadialGradientElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGRadialGradientElement: {
  readonly prototype: SVGRadialGradientElement;
  new (): SVGRadialGradientElement;
};

/** Provides access to the properties of <rect> elements, as well as methods to manipulate them. */
interface SVGRectElement extends SVGGeometryElement {
  readonly height: SVGAnimatedLength;
  readonly rx: SVGAnimatedLength;
  readonly ry: SVGAnimatedLength;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGRectElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGRectElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGRectElement: {
  readonly prototype: SVGRectElement;
  new (): SVGRectElement;
};

interface SVGSVGElementEventMap
  extends SVGElementEventMap,
    WindowEventHandlersEventMap {}

/** Provides access to the properties of <svg> elements, as well as methods to manipulate them. This interface contains also various miscellaneous commonly-used utility methods, such as matrix operations and the ability to control the time of redraw on visual rendering devices. */
interface SVGSVGElement
  extends SVGGraphicsElement,
    SVGFitToViewBox,
    WindowEventHandlers {
  readonly currentScale: number;
  readonly currentTranslate: DOMPointReadOnly;
  readonly height: SVGAnimatedLength;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
  animationsPaused(): boolean;
  checkEnclosure(element: SVGElement, rect: DOMRectReadOnly): boolean;
  checkIntersection(element: SVGElement, rect: DOMRectReadOnly): boolean;
  createSVGAngle(): SVGAngle;
  createSVGLength(): SVGLength;
  createSVGMatrix(): DOMMatrix;
  createSVGNumber(): SVGNumber;
  createSVGPoint(): DOMPoint;
  createSVGRect(): DOMRect;
  createSVGTransform(): SVGTransform;
  createSVGTransformFromMatrix(matrix?: DOMMatrix2DInit): SVGTransform;
  deselectAll(): void;
  /** @deprecated */
  forceRedraw(): void;
  getCurrentTime(): number;
  getElementById(elementId: string): Element;
  getEnclosureList(
    rect: DOMRectReadOnly,
    referenceElement: SVGElement | null
  ): NodeListOf<
    | SVGCircleElement
    | SVGEllipseElement
    | SVGImageElement
    | SVGLineElement
    | SVGPathElement
    | SVGPolygonElement
    | SVGPolylineElement
    | SVGRectElement
    | SVGTextElement
    | SVGUseElement
  >;
  getIntersectionList(
    rect: DOMRectReadOnly,
    referenceElement: SVGElement | null
  ): NodeListOf<
    | SVGCircleElement
    | SVGEllipseElement
    | SVGImageElement
    | SVGLineElement
    | SVGPathElement
    | SVGPolygonElement
    | SVGPolylineElement
    | SVGRectElement
    | SVGTextElement
    | SVGUseElement
  >;
  pauseAnimations(): void;
  setCurrentTime(seconds: number): void;
  /** @deprecated */
  suspendRedraw(maxWaitMilliseconds: number): number;
  unpauseAnimations(): void;
  /** @deprecated */
  unsuspendRedraw(suspendHandleID: number): void;
  /** @deprecated */
  unsuspendRedrawAll(): void;
  addEventListener<K extends keyof SVGSVGElementEventMap>(
    type: K,
    listener: (this: SVGSVGElement, ev: SVGSVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGSVGElementEventMap>(
    type: K,
    listener: (this: SVGSVGElement, ev: SVGSVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGSVGElement: {
  readonly prototype: SVGSVGElement;
  new (): SVGSVGElement;
};

/** Corresponds to the SVG <script> element. */
interface SVGScriptElement extends SVGElement, SVGURIReference {
  readonly type: string;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGScriptElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGScriptElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGScriptElement: {
  readonly prototype: SVGScriptElement;
  new (): SVGScriptElement;
};

interface SVGSetElement extends SVGAnimationElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGSetElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGSetElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGSetElement: {
  readonly prototype: SVGSetElement;
  new (): SVGSetElement;
};

/** Corresponds to the <stop> element. */
interface SVGStopElement extends SVGElement {
  readonly offset: SVGAnimatedNumber;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGStopElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGStopElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGStopElement: {
  readonly prototype: SVGStopElement;
  new (): SVGStopElement;
};

/** The SVGStringList defines a list of DOMString objects. */
interface SVGStringList {
  readonly length: number;
  readonly numberOfItems: number;
  appendItem(newItem: string): string;
  clear(): void;
  getItem(index: number): string;
  initialize(newItem: string): string;
  insertItemBefore(newItem: string, index: number): string;
  removeItem(index: number): string;
  replaceItem(newItem: string, index: number): string;
  readonly [index: number]: string;
}

declare const SVGStringList: {
  readonly prototype: SVGStringList;
  new (): SVGStringList;
};

/** Corresponds to the SVG <style> element. */
interface SVGStyleElement extends SVGElement, LinkStyle {
  readonly disabled: boolean;
  readonly media: string;
  readonly title: string;
  readonly type: string;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGStyleElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGStyleElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGStyleElement: {
  readonly prototype: SVGStyleElement;
  new (): SVGStyleElement;
};

/** Corresponds to the <switch> element. */
interface SVGSwitchElement extends SVGGraphicsElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGSwitchElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGSwitchElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGSwitchElement: {
  readonly prototype: SVGSwitchElement;
  new (): SVGSwitchElement;
};

/** Corresponds to the <symbol> element. */
interface SVGSymbolElement extends SVGElement, SVGFitToViewBox {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGSymbolElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGSymbolElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGSymbolElement: {
  readonly prototype: SVGSymbolElement;
  new (): SVGSymbolElement;
};

/** A <tspan> element. */
interface SVGTSpanElement extends SVGTextPositioningElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGTSpanElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGTSpanElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGTSpanElement: {
  readonly prototype: SVGTSpanElement;
  new (): SVGTSpanElement;
};

interface SVGTests {
  readonly requiredExtensions: SVGStringList;
  readonly systemLanguage: SVGStringList;
}

/** Implemented by elements that support rendering child text content. It is inherited by various text-related interfaces, such as SVGTextElement, SVGTSpanElement, SVGTRefElement, SVGAltGlyphElement and SVGTextPathElement. */
interface SVGTextContentElement extends SVGGraphicsElement {
  readonly lengthAdjust: SVGAnimatedEnumeration;
  readonly textLength: SVGAnimatedLength;
  getCharNumAtPosition(point?: DOMPointInit): number;
  getComputedTextLength(): number;
  getEndPositionOfChar(charnum: number): DOMPoint;
  getExtentOfChar(charnum: number): DOMRect;
  getNumberOfChars(): number;
  getRotationOfChar(charnum: number): number;
  getStartPositionOfChar(charnum: number): DOMPoint;
  getSubStringLength(charnum: number, nchars: number): number;
  /** @deprecated */
  selectSubString(charnum: number, nchars: number): void;
  readonly LENGTHADJUST_SPACING: number;
  readonly LENGTHADJUST_SPACINGANDGLYPHS: number;
  readonly LENGTHADJUST_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGTextContentElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGTextContentElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGTextContentElement: {
  readonly prototype: SVGTextContentElement;
  new (): SVGTextContentElement;
  readonly LENGTHADJUST_SPACING: number;
  readonly LENGTHADJUST_SPACINGANDGLYPHS: number;
  readonly LENGTHADJUST_UNKNOWN: number;
};

/** Corresponds to the <text> elements. */
interface SVGTextElement extends SVGTextPositioningElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGTextElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGTextElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGTextElement: {
  readonly prototype: SVGTextElement;
  new (): SVGTextElement;
};

/** Corresponds to the <textPath> element. */
interface SVGTextPathElement extends SVGTextContentElement, SVGURIReference {
  readonly method: SVGAnimatedEnumeration;
  readonly spacing: SVGAnimatedEnumeration;
  readonly startOffset: SVGAnimatedLength;
  readonly TEXTPATH_METHODTYPE_ALIGN: number;
  readonly TEXTPATH_METHODTYPE_STRETCH: number;
  readonly TEXTPATH_METHODTYPE_UNKNOWN: number;
  readonly TEXTPATH_SPACINGTYPE_AUTO: number;
  readonly TEXTPATH_SPACINGTYPE_EXACT: number;
  readonly TEXTPATH_SPACINGTYPE_UNKNOWN: number;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGTextPathElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGTextPathElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGTextPathElement: {
  readonly prototype: SVGTextPathElement;
  new (): SVGTextPathElement;
  readonly TEXTPATH_METHODTYPE_ALIGN: number;
  readonly TEXTPATH_METHODTYPE_STRETCH: number;
  readonly TEXTPATH_METHODTYPE_UNKNOWN: number;
  readonly TEXTPATH_SPACINGTYPE_AUTO: number;
  readonly TEXTPATH_SPACINGTYPE_EXACT: number;
  readonly TEXTPATH_SPACINGTYPE_UNKNOWN: number;
};

/** Implemented by elements that support attributes that position individual text glyphs. It is inherited by SVGTextElement, SVGTSpanElement, SVGTRefElement and SVGAltGlyphElement. */
interface SVGTextPositioningElement extends SVGTextContentElement {
  readonly dx: SVGAnimatedLengthList;
  readonly dy: SVGAnimatedLengthList;
  readonly rotate: SVGAnimatedNumberList;
  readonly x: SVGAnimatedLengthList;
  readonly y: SVGAnimatedLengthList;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGTextPositioningElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (
      this: SVGTextPositioningElement,
      ev: SVGElementEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGTextPositioningElement: {
  readonly prototype: SVGTextPositioningElement;
  new (): SVGTextPositioningElement;
};

/** Corresponds to the <title> element. */
interface SVGTitleElement extends SVGElement {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGTitleElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGTitleElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGTitleElement: {
  readonly prototype: SVGTitleElement;
  new (): SVGTitleElement;
};

/** SVGTransform is the interface for one of the component transformations within an SVGTransformList; thus, an SVGTransform object corresponds to a single component (e.g., scale(…) or matrix(…)) within a transform attribute. */
interface SVGTransform {
  readonly angle: number;
  readonly matrix: DOMMatrix;
  readonly type: number;
  setMatrix(matrix?: DOMMatrix2DInit): void;
  setRotate(angle: number, cx: number, cy: number): void;
  setScale(sx: number, sy: number): void;
  setSkewX(angle: number): void;
  setSkewY(angle: number): void;
  setTranslate(tx: number, ty: number): void;
  readonly SVG_TRANSFORM_MATRIX: number;
  readonly SVG_TRANSFORM_ROTATE: number;
  readonly SVG_TRANSFORM_SCALE: number;
  readonly SVG_TRANSFORM_SKEWX: number;
  readonly SVG_TRANSFORM_SKEWY: number;
  readonly SVG_TRANSFORM_TRANSLATE: number;
  readonly SVG_TRANSFORM_UNKNOWN: number;
}

declare const SVGTransform: {
  readonly prototype: SVGTransform;
  new (): SVGTransform;
  readonly SVG_TRANSFORM_MATRIX: number;
  readonly SVG_TRANSFORM_ROTATE: number;
  readonly SVG_TRANSFORM_SCALE: number;
  readonly SVG_TRANSFORM_SKEWX: number;
  readonly SVG_TRANSFORM_SKEWY: number;
  readonly SVG_TRANSFORM_TRANSLATE: number;
  readonly SVG_TRANSFORM_UNKNOWN: number;
};

/** The SVGTransformList defines a list of SVGTransform objects. */
interface SVGTransformList {
  readonly length: number;
  readonly numberOfItems: number;
  appendItem(newItem: SVGTransform): SVGTransform;
  clear(): void;
  consolidate(): SVGTransform | null;
  createSVGTransformFromMatrix(matrix?: DOMMatrix2DInit): SVGTransform;
  getItem(index: number): SVGTransform;
  initialize(newItem: SVGTransform): SVGTransform;
  insertItemBefore(newItem: SVGTransform, index: number): SVGTransform;
  removeItem(index: number): SVGTransform;
  replaceItem(newItem: SVGTransform, index: number): SVGTransform;
  readonly [index: number]: SVGTransform;
}

declare const SVGTransformList: {
  readonly prototype: SVGTransformList;
  new (): SVGTransformList;
};

interface SVGURIReference {
  readonly href: SVGAnimatedString;
}

/** A commonly used set of constants used for reflecting gradientUnits, patternContentUnits and other similar attributes. */
interface SVGUnitTypes {
  readonly SVG_UNIT_TYPE_OBJECTBOUNDINGBOX: number;
  readonly SVG_UNIT_TYPE_UNKNOWN: number;
  readonly SVG_UNIT_TYPE_USERSPACEONUSE: number;
}

declare const SVGUnitTypes: {
  readonly prototype: SVGUnitTypes;
  new (): SVGUnitTypes;
  readonly SVG_UNIT_TYPE_OBJECTBOUNDINGBOX: number;
  readonly SVG_UNIT_TYPE_UNKNOWN: number;
  readonly SVG_UNIT_TYPE_USERSPACEONUSE: number;
};

/** Corresponds to the <use> element. */
interface SVGUseElement extends SVGGraphicsElement, SVGURIReference {
  readonly height: SVGAnimatedLength;
  readonly width: SVGAnimatedLength;
  readonly x: SVGAnimatedLength;
  readonly y: SVGAnimatedLength;
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGUseElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGUseElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGUseElement: {
  readonly prototype: SVGUseElement;
  new (): SVGUseElement;
};

/** Provides access to the properties of <view> elements, as well as methods to manipulate them. */
interface SVGViewElement extends SVGElement, SVGFitToViewBox {
  addEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGViewElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SVGElementEventMap>(
    type: K,
    listener: (this: SVGViewElement, ev: SVGElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SVGViewElement: {
  readonly prototype: SVGViewElement;
  new (): SVGViewElement;
};

/** A screen, usually the one on which the current window is being rendered, and is obtained using window.screen. */
interface Screen {
  readonly availHeight: number;
  readonly availWidth: number;
  readonly colorDepth: number;
  readonly height: number;
  readonly orientation: ScreenOrientation;
  readonly pixelDepth: number;
  readonly width: number;
}

declare const Screen: {
  readonly prototype: Screen;
  new (): Screen;
};

interface ScreenOrientationEventMap {
  readonly change: Event;
}

interface ScreenOrientation extends EventTarget {
  readonly angle: number;
  readonly onchange: ((this: ScreenOrientation, ev: Event) => unknown) | null;
  readonly type: OrientationType;
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
  addEventListener<K extends keyof ScreenOrientationEventMap>(
    type: K,
    listener: (
      this: ScreenOrientation,
      ev: ScreenOrientationEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ScreenOrientationEventMap>(
    type: K,
    listener: (
      this: ScreenOrientation,
      ev: ScreenOrientationEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const ScreenOrientation: {
  readonly prototype: ScreenOrientation;
  new (): ScreenOrientation;
};

interface ScriptProcessorNodeEventMap {
  readonly audioprocess: AudioProcessingEvent;
}

/**
 * Allows the generation, processing, or analyzing of audio using JavaScript.
 * @deprecated As of the August 29 2014 Web Audio API spec publication, this feature has been marked as deprecated, and was replaced by AudioWorklet (see AudioWorkletNode).
 */
interface ScriptProcessorNode extends AudioNode {
  /** @deprecated */
  readonly bufferSize: number;
  /** @deprecated */
  readonly onaudioprocess:
    | ((this: ScriptProcessorNode, ev: AudioProcessingEvent) => unknown)
    | null;
  addEventListener<K extends keyof ScriptProcessorNodeEventMap>(
    type: K,
    listener: (
      this: ScriptProcessorNode,
      ev: ScriptProcessorNodeEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ScriptProcessorNodeEventMap>(
    type: K,
    listener: (
      this: ScriptProcessorNode,
      ev: ScriptProcessorNodeEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

/** @deprecated */
declare const ScriptProcessorNode: {
  readonly prototype: ScriptProcessorNode;
  new (): ScriptProcessorNode;
};

/** Inherits from Event, and represents the event object of an event sent on a document or worker when its content security policy is violated. */
interface SecurityPolicyViolationEvent extends Event {
  readonly blockedURI: string;
  readonly columnNumber: number;
  readonly disposition: SecurityPolicyViolationEventDisposition;
  readonly documentURI: string;
  readonly effectiveDirective: string;
  readonly lineNumber: number;
  readonly originalPolicy: string;
  readonly referrer: string;
  readonly sample: string;
  readonly sourceFile: string;
  readonly statusCode: number;
  readonly violatedDirective: string;
}

declare const SecurityPolicyViolationEvent: {
  readonly prototype: SecurityPolicyViolationEvent;
  new (
    type: string,
    eventInitDict?: SecurityPolicyViolationEventInit
  ): SecurityPolicyViolationEvent;
};

/** A Selection object represents the range of text selected by the user or the current position of the caret. To obtain a Selection object for examination or modification, call Window.getSelection(). */
interface Selection {
  readonly anchorNode: Node | null;
  readonly anchorOffset: number;
  readonly focusNode: Node | null;
  readonly focusOffset: number;
  readonly isCollapsed: boolean;
  readonly rangeCount: number;
  readonly type: string;
  addRange(range: Range): void;
  collapse(node: Node | null, offset?: number): void;
  collapseToEnd(): void;
  collapseToStart(): void;
  containsNode(node: Node, allowPartialContainment?: boolean): boolean;
  deleteFromDocument(): void;
  empty(): void;
  extend(node: Node, offset?: number): void;
  getRangeAt(index: number): Range;
  removeAllRanges(): void;
  removeRange(range: Range): void;
  selectAllChildren(node: Node): void;
  setBaseAndExtent(
    anchorNode: Node,
    anchorOffset: number,
    focusNode: Node,
    focusOffset: number
  ): void;
  setPosition(node: Node | null, offset?: number): void;
  toString(): string;
}

declare const Selection: {
  readonly prototype: Selection;
  new (): Selection;
  toString(): string;
};

interface ServiceWorkerEventMap extends AbstractWorkerEventMap {
  readonly statechange: Event;
}

/**
 * This ServiceWorker API interface provides a reference to a service worker. Multiple browsing contexts (e.g. pages, workers, etc.) can be associated with the same service worker, each through a unique ServiceWorker object.
 * Available only in secure contexts.
 */
interface ServiceWorker extends EventTarget, AbstractWorker {
  readonly onstatechange: ((this: ServiceWorker, ev: Event) => unknown) | null;
  readonly scriptURL: string;
  readonly state: ServiceWorkerState;
  postMessage(message: unknown, transfer: readonly Transferable[]): void;
  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
  addEventListener<K extends keyof ServiceWorkerEventMap>(
    type: K,
    listener: (this: ServiceWorker, ev: ServiceWorkerEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ServiceWorkerEventMap>(
    type: K,
    listener: (this: ServiceWorker, ev: ServiceWorkerEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const ServiceWorker: {
  readonly prototype: ServiceWorker;
  new (): ServiceWorker;
};

interface ServiceWorkerContainerEventMap {
  readonly controllerchange: Event;
  readonly message: MessageEvent;
  readonly messageerror: MessageEvent;
}

/**
 * The ServiceWorkerContainer interface of the ServiceWorker API provides an object representing the service worker as an overall unit in the network ecosystem, including facilities to register, unregister and update service workers, and access the state of service workers and their registrations.
 * Available only in secure contexts.
 */
interface ServiceWorkerContainer extends EventTarget {
  readonly controller: ServiceWorker | null;
  readonly oncontrollerchange:
    | ((this: ServiceWorkerContainer, ev: Event) => unknown)
    | null;
  readonly onmessage:
    | ((this: ServiceWorkerContainer, ev: MessageEvent) => unknown)
    | null;
  readonly onmessageerror:
    | ((this: ServiceWorkerContainer, ev: MessageEvent) => unknown)
    | null;
  readonly ready: Promise<ServiceWorkerRegistration>;
  getRegistration(
    clientURL?: string | URL
  ): Promise<ServiceWorkerRegistration | undefined>;
  getRegistrations(): Promise<ReadonlyArray<ServiceWorkerRegistration>>;
  register(
    scriptURL: string | URL,
    options?: RegistrationOptions
  ): Promise<ServiceWorkerRegistration>;
  startMessages(): void;
  addEventListener<K extends keyof ServiceWorkerContainerEventMap>(
    type: K,
    listener: (
      this: ServiceWorkerContainer,
      ev: ServiceWorkerContainerEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ServiceWorkerContainerEventMap>(
    type: K,
    listener: (
      this: ServiceWorkerContainer,
      ev: ServiceWorkerContainerEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const ServiceWorkerContainer: {
  readonly prototype: ServiceWorkerContainer;
  new (): ServiceWorkerContainer;
};

interface ServiceWorkerRegistrationEventMap {
  readonly updatefound: Event;
}

/**
 * This ServiceWorker API interface represents the service worker registration. You register a service worker to control one or more pages that share the same origin.
 * Available only in secure contexts.
 */
interface ServiceWorkerRegistration extends EventTarget {
  readonly active: ServiceWorker | null;
  readonly installing: ServiceWorker | null;
  readonly navigationPreload: NavigationPreloadManager;
  readonly onupdatefound:
    | ((this: ServiceWorkerRegistration, ev: Event) => unknown)
    | null;
  readonly pushManager: PushManager;
  readonly scope: string;
  readonly updateViaCache: ServiceWorkerUpdateViaCache;
  readonly waiting: ServiceWorker | null;
  getNotifications(
    filter?: GetNotificationOptions
  ): Promise<readonly Notification[]>;
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
  unregister(): Promise<boolean>;
  update(): Promise<void>;
  addEventListener<K extends keyof ServiceWorkerRegistrationEventMap>(
    type: K,
    listener: (
      this: ServiceWorkerRegistration,
      ev: ServiceWorkerRegistrationEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ServiceWorkerRegistrationEventMap>(
    type: K,
    listener: (
      this: ServiceWorkerRegistration,
      ev: ServiceWorkerRegistrationEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const ServiceWorkerRegistration: {
  readonly prototype: ServiceWorkerRegistration;
  new (): ServiceWorkerRegistration;
};

interface ShadowRootEventMap {
  readonly slotchange: Event;
}

interface ShadowRoot extends DocumentFragment, DocumentOrShadowRoot, InnerHTML {
  readonly delegatesFocus: boolean;
  readonly host: Element;
  readonly mode: ShadowRootMode;
  readonly onslotchange: ((this: ShadowRoot, ev: Event) => unknown) | null;
  readonly slotAssignment: SlotAssignmentMode;
  /** Throws a "NotSupportedError" DOMException if context object is a shadow root. */
  addEventListener<K extends keyof ShadowRootEventMap>(
    type: K,
    listener: (this: ShadowRoot, ev: ShadowRootEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ShadowRootEventMap>(
    type: K,
    listener: (this: ShadowRoot, ev: ShadowRootEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const ShadowRoot: {
  readonly prototype: ShadowRoot;
  new (): ShadowRoot;
};

interface SharedWorker extends EventTarget, AbstractWorker {
  /** Returns sharedWorker's MessagePort object which can be used to communicate with the global environment. */
  readonly port: MessagePort;
  addEventListener<K extends keyof AbstractWorkerEventMap>(
    type: K,
    listener: (this: SharedWorker, ev: AbstractWorkerEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof AbstractWorkerEventMap>(
    type: K,
    listener: (this: SharedWorker, ev: AbstractWorkerEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SharedWorker: {
  readonly prototype: SharedWorker;
  new (scriptURL: string | URL, options?: string | WorkerOptions): SharedWorker;
};

interface Slottable {
  readonly assignedSlot: HTMLSlotElement | null;
}

interface SourceBufferEventMap {
  readonly abort: Event;
  readonly error: Event;
  readonly update: Event;
  readonly updateend: Event;
  readonly updatestart: Event;
}

/** A chunk of media to be passed into an HTMLMediaElement and played, via a MediaSource object. This can be made up of one or several media segments. */
interface SourceBuffer extends EventTarget {
  readonly appendWindowEnd: number;
  readonly appendWindowStart: number;
  readonly buffered: TimeRanges;
  readonly mode: AppendMode;
  readonly onabort: ((this: SourceBuffer, ev: Event) => unknown) | null;
  readonly onerror: ((this: SourceBuffer, ev: Event) => unknown) | null;
  readonly onupdate: ((this: SourceBuffer, ev: Event) => unknown) | null;
  readonly onupdateend: ((this: SourceBuffer, ev: Event) => unknown) | null;
  readonly onupdatestart: ((this: SourceBuffer, ev: Event) => unknown) | null;
  readonly timestampOffset: number;
  readonly updating: boolean;
  abort(): void;
  appendBuffer(data: BufferSource): void;
  changeType(type: string): void;
  remove(start: number, end: number): void;
  addEventListener<K extends keyof SourceBufferEventMap>(
    type: K,
    listener: (this: SourceBuffer, ev: SourceBufferEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SourceBufferEventMap>(
    type: K,
    listener: (this: SourceBuffer, ev: SourceBufferEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SourceBuffer: {
  readonly prototype: SourceBuffer;
  new (): SourceBuffer;
};

interface SourceBufferListEventMap {
  readonly addsourcebuffer: Event;
  readonly removesourcebuffer: Event;
}

/** A simple container list for multiple SourceBuffer objects. */
interface SourceBufferList extends EventTarget {
  readonly length: number;
  readonly onaddsourcebuffer:
    | ((this: SourceBufferList, ev: Event) => unknown)
    | null;
  readonly onremovesourcebuffer:
    | ((this: SourceBufferList, ev: Event) => unknown)
    | null;
  addEventListener<K extends keyof SourceBufferListEventMap>(
    type: K,
    listener: (
      this: SourceBufferList,
      ev: SourceBufferListEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SourceBufferListEventMap>(
    type: K,
    listener: (
      this: SourceBufferList,
      ev: SourceBufferListEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  readonly [index: number]: SourceBuffer;
}

declare const SourceBufferList: {
  readonly prototype: SourceBufferList;
  new (): SourceBufferList;
};

interface SpeechRecognitionAlternative {
  readonly confidence: number;
  readonly transcript: string;
}

declare const SpeechRecognitionAlternative: {
  readonly prototype: SpeechRecognitionAlternative;
  new (): SpeechRecognitionAlternative;
};

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  readonly [index: number]: SpeechRecognitionAlternative;
}

declare const SpeechRecognitionResult: {
  readonly prototype: SpeechRecognitionResult;
  new (): SpeechRecognitionResult;
};

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  readonly [index: number]: SpeechRecognitionResult;
}

declare const SpeechRecognitionResultList: {
  readonly prototype: SpeechRecognitionResultList;
  new (): SpeechRecognitionResultList;
};

interface SpeechSynthesisEventMap {
  readonly voiceschanged: Event;
}

/** This Web Speech API interface is the controller interface for the speech service; this can be used to retrieve information about the synthesis voices available on the device, start and pause speech, and other commands besides. */
interface SpeechSynthesis extends EventTarget {
  readonly onvoiceschanged:
    | ((this: SpeechSynthesis, ev: Event) => unknown)
    | null;
  readonly paused: boolean;
  readonly pending: boolean;
  readonly speaking: boolean;
  cancel(): void;
  getVoices(): readonly SpeechSynthesisVoice[];
  pause(): void;
  resume(): void;
  speak(utterance: SpeechSynthesisUtterance): void;
  addEventListener<K extends keyof SpeechSynthesisEventMap>(
    type: K,
    listener: (
      this: SpeechSynthesis,
      ev: SpeechSynthesisEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SpeechSynthesisEventMap>(
    type: K,
    listener: (
      this: SpeechSynthesis,
      ev: SpeechSynthesisEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SpeechSynthesis: {
  readonly prototype: SpeechSynthesis;
  new (): SpeechSynthesis;
};

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  readonly error: SpeechSynthesisErrorCode;
}

declare const SpeechSynthesisErrorEvent: {
  readonly prototype: SpeechSynthesisErrorEvent;
  new (
    type: string,
    eventInitDict: SpeechSynthesisErrorEventInit
  ): SpeechSynthesisErrorEvent;
};

/** This Web Speech API interface contains information about the current state of SpeechSynthesisUtterance objects that have been processed in the speech service. */
interface SpeechSynthesisEvent extends Event {
  readonly charIndex: number;
  readonly charLength: number;
  readonly elapsedTime: number;
  readonly name: string;
  readonly utterance: SpeechSynthesisUtterance;
}

declare const SpeechSynthesisEvent: {
  readonly prototype: SpeechSynthesisEvent;
  new (
    type: string,
    eventInitDict: SpeechSynthesisEventInit
  ): SpeechSynthesisEvent;
};

interface SpeechSynthesisUtteranceEventMap {
  readonly boundary: SpeechSynthesisEvent;
  readonly end: SpeechSynthesisEvent;
  readonly error: SpeechSynthesisErrorEvent;
  readonly mark: SpeechSynthesisEvent;
  readonly pause: SpeechSynthesisEvent;
  readonly resume: SpeechSynthesisEvent;
  readonly start: SpeechSynthesisEvent;
}

/** This Web Speech API interface represents a speech request. It contains the content the speech service should read and information about how to read it (e.g. language, pitch and volume.) */
interface SpeechSynthesisUtterance extends EventTarget {
  readonly lang: string;
  readonly onboundary:
    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
    | null;
  readonly onend:
    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
    | null;
  readonly onerror:
    | ((
        this: SpeechSynthesisUtterance,
        ev: SpeechSynthesisErrorEvent
      ) => unknown)
    | null;
  readonly onmark:
    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
    | null;
  readonly onpause:
    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
    | null;
  readonly onresume:
    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
    | null;
  readonly onstart:
    | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown)
    | null;
  readonly pitch: number;
  readonly rate: number;
  readonly text: string;
  readonly voice: SpeechSynthesisVoice | null;
  readonly volume: number;
  addEventListener<K extends keyof SpeechSynthesisUtteranceEventMap>(
    type: K,
    listener: (
      this: SpeechSynthesisUtterance,
      ev: SpeechSynthesisUtteranceEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof SpeechSynthesisUtteranceEventMap>(
    type: K,
    listener: (
      this: SpeechSynthesisUtterance,
      ev: SpeechSynthesisUtteranceEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const SpeechSynthesisUtterance: {
  readonly prototype: SpeechSynthesisUtterance;
  new (text?: string): SpeechSynthesisUtterance;
};

/** This Web Speech API interface represents a voice that the system supports. Every SpeechSynthesisVoice has its own relative speech service including information about language, name and URI. */
interface SpeechSynthesisVoice {
  readonly default: boolean;
  readonly lang: string;
  readonly localService: boolean;
  readonly name: string;
  readonly voiceURI: string;
}

declare const SpeechSynthesisVoice: {
  readonly prototype: SpeechSynthesisVoice;
  new (): SpeechSynthesisVoice;
};

interface StaticRange extends AbstractRange {}

declare const StaticRange: {
  readonly prototype: StaticRange;
  new (init: StaticRangeInit): StaticRange;
};

/** The pan property takes a unitless value between -1 (full left pan) and 1 (full right pan). This interface was introduced as a much simpler way to apply a simple panning effect than having to use a full PannerNode. */
interface StereoPannerNode extends AudioNode {
  readonly pan: AudioParam;
}

declare const StereoPannerNode: {
  readonly prototype: StereoPannerNode;
  new (
    context: BaseAudioContext,
    options?: StereoPannerOptions
  ): StereoPannerNode;
};

/** This Web Storage API interface provides access to a particular domain's session or local storage. It allows, for example, the addition, modification, or deletion of stored data items. */
interface Storage {
  /** Returns the number of key/value pairs. */
  readonly length: number;
  /**
   * Removes all key/value pairs, if there are any.
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  clear(): void;
  /** Returns the current value associated with the given key, or null if the given key does not exist. */
  getItem(key: string): string | null;
  /** Returns the name of the nth key, or null if n is greater than or equal to the number of key/value pairs. */
  key(index: number): string | null;
  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  removeItem(key: string): void;
  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  setItem(key: string, value: string): void;
  readonly [name: string]: unknown;
}

declare const Storage: {
  readonly prototype: Storage;
  new (): Storage;
};

/** A StorageEvent is sent to a window when a storage area it has access to is changed within the context of another document. */
interface StorageEvent extends Event {
  /** Returns the key of the storage item being changed. */
  readonly key: string | null;
  /** Returns the new value of the key of the storage item whose value is being changed. */
  readonly newValue: string | null;
  /** Returns the old value of the key of the storage item whose value is being changed. */
  readonly oldValue: string | null;
  /** Returns the Storage object that was affected. */
  readonly storageArea: Storage | null;
  /** Returns the URL of the document whose storage item changed. */
  readonly url: string;
  initStorageEvent(
    type: string,
    bubbles?: boolean,
    cancelable?: boolean,
    key?: string | null,
    oldValue?: string | null,
    newValue?: string | null,
    url?: string | URL,
    storageArea?: Storage | null
  ): void;
}

declare const StorageEvent: {
  readonly prototype: StorageEvent;
  new (type: string, eventInitDict?: StorageEventInit): StorageEvent;
};

/** Available only in secure contexts. */
interface StorageManager {
  estimate(): Promise<StorageEstimate>;
  getDirectory(): Promise<FileSystemDirectoryHandle>;
  persist(): Promise<boolean>;
  persisted(): Promise<boolean>;
}

declare const StorageManager: {
  readonly prototype: StorageManager;
  new (): StorageManager;
};

/** @deprecated */
interface StyleMedia {
  readonly type: string;
  matchMedium(mediaquery: string): boolean;
}

/** A single style sheet. CSS style sheets will further implement the more specialized CSSStyleSheet interface. */
interface StyleSheet {
  readonly disabled: boolean;
  readonly href: string | null;
  readonly media: MediaList;
  readonly ownerNode: Element | ProcessingInstruction | null;
  readonly parentStyleSheet: CSSStyleSheet | null;
  readonly title: string | null;
  readonly type: string;
}

declare const StyleSheet: {
  readonly prototype: StyleSheet;
  new (): StyleSheet;
};

/** A list of StyleSheet. */
interface StyleSheetList {
  readonly length: number;
  item(index: number): CSSStyleSheet | null;
  readonly [index: number]: CSSStyleSheet;
}

declare const StyleSheetList: {
  readonly prototype: StyleSheetList;
  new (): StyleSheetList;
};

interface SubmitEvent extends Event {
  /** Returns the element representing the submit button that triggered the form submission, or null if the submission was not triggered by a button. */
  readonly submitter: HTMLElement | null;
}

declare const SubmitEvent: {
  readonly prototype: SubmitEvent;
  new (type: string, eventInitDict?: SubmitEventInit): SubmitEvent;
};

/**
 * This Web Crypto API interface provides a number of low-level cryptographic functions. It is accessed via the Crypto.subtle properties available in a window context (via Window.crypto).
 * Available only in secure contexts.
 */
interface SubtleCrypto {
  decrypt(
    algorithm:
      | AlgorithmIdentifier
      | RsaOaepParams
      | AesCtrParams
      | AesCbcParams
      | AesGcmParams,
    key: CryptoKey,
    data: BufferSource
  ): Promise<unknown>;
  deriveBits(
    algorithm:
      | AlgorithmIdentifier
      | EcdhKeyDeriveParams
      | HkdfParams
      | Pbkdf2Params,
    baseKey: CryptoKey,
    length: number
  ): Promise<ArrayBuffer>;
  deriveKey(
    algorithm:
      | AlgorithmIdentifier
      | EcdhKeyDeriveParams
      | HkdfParams
      | Pbkdf2Params,
    baseKey: CryptoKey,
    derivedKeyType:
      | AlgorithmIdentifier
      | AesDerivedKeyParams
      | HmacImportParams
      | HkdfParams
      | Pbkdf2Params,
    extractable: boolean,
    keyUsages: readonly KeyUsage[]
  ): Promise<CryptoKey>;
  digest(
    algorithm: AlgorithmIdentifier,
    data: BufferSource
  ): Promise<ArrayBuffer>;
  encrypt(
    algorithm:
      | AlgorithmIdentifier
      | RsaOaepParams
      | AesCtrParams
      | AesCbcParams
      | AesGcmParams,
    key: CryptoKey,
    data: BufferSource
  ): Promise<unknown>;
  exportKey(format: 'jwk', key: CryptoKey): Promise<JsonWebKey>;
  exportKey(
    format: Exclude<KeyFormat, 'jwk'>,
    key: CryptoKey
  ): Promise<ArrayBuffer>;
  generateKey(
    algorithm: RsaHashedKeyGenParams | EcKeyGenParams,
    extractable: boolean,
    keyUsages: ReadonlyArray<KeyUsage>
  ): Promise<CryptoKeyPair>;
  generateKey(
    algorithm: AesKeyGenParams | HmacKeyGenParams | Pbkdf2Params,
    extractable: boolean,
    keyUsages: ReadonlyArray<KeyUsage>
  ): Promise<CryptoKey>;
  generateKey(
    algorithm: AlgorithmIdentifier,
    extractable: boolean,
    keyUsages: readonly KeyUsage[]
  ): Promise<CryptoKeyPair | CryptoKey>;
  importKey(
    format: 'jwk',
    keyData: JsonWebKey,
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm,
    extractable: boolean,
    keyUsages: ReadonlyArray<KeyUsage>
  ): Promise<CryptoKey>;
  importKey(
    format: Exclude<KeyFormat, 'jwk'>,
    keyData: BufferSource,
    algorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm,
    extractable: boolean,
    keyUsages: readonly KeyUsage[]
  ): Promise<CryptoKey>;
  sign(
    algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams,
    key: CryptoKey,
    data: BufferSource
  ): Promise<ArrayBuffer>;
  unwrapKey(
    format: KeyFormat,
    wrappedKey: BufferSource,
    unwrappingKey: CryptoKey,
    unwrapAlgorithm:
      | AlgorithmIdentifier
      | RsaOaepParams
      | AesCtrParams
      | AesCbcParams
      | AesGcmParams,
    unwrappedKeyAlgorithm:
      | AlgorithmIdentifier
      | RsaHashedImportParams
      | EcKeyImportParams
      | HmacImportParams
      | AesKeyAlgorithm,
    extractable: boolean,
    keyUsages: readonly KeyUsage[]
  ): Promise<CryptoKey>;
  verify(
    algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams,
    key: CryptoKey,
    signature: BufferSource,
    data: BufferSource
  ): Promise<boolean>;
  wrapKey(
    format: KeyFormat,
    key: CryptoKey,
    wrappingKey: CryptoKey,
    wrapAlgorithm:
      | AlgorithmIdentifier
      | RsaOaepParams
      | AesCtrParams
      | AesCbcParams
      | AesGcmParams
  ): Promise<ArrayBuffer>;
}

declare const SubtleCrypto: {
  readonly prototype: SubtleCrypto;
  new (): SubtleCrypto;
};

/** The textual content of Element or Attr. If an element has no markup within its content, it has a single child implementing Text that contains the element's text. However, if the element contains markup, it is parsed into information items and Text nodes that form its children. */
interface Text extends CharacterData, Slottable {
  /** Returns the combined data of all direct Text node siblings. */
  readonly wholeText: string;
  /** Splits data at the given offset and returns the remainder as Text node. */
  splitText(offset: number): Text;
}

declare const Text: {
  readonly prototype: Text;
  new (data?: string): Text;
};

/** A decoder for a specific method, that is a specific character encoding, like utf-8, iso-8859-2, koi8, cp1261, gbk, etc. A decoder takes a stream of bytes as input and emits a stream of code points. For a more scalable, non-native library, see StringView – a C-like representation of strings based on typed arrays. */
interface TextDecoder extends TextDecoderCommon {
  /**
   * Returns the result of running encoding's decoder. The method can be invoked zero or more times with options's stream set to true, and then once without options's stream (or set to false), to process a fragmented input. If the invocation without options's stream (or set to false) has no input, it's clearest to omit both arguments.
   *
   * ```
   * var string = "", decoder = new TextDecoder(encoding), buffer;
   * while(buffer = next_chunk()) {
   *   string += decoder.decode(buffer, {stream:true});
   * }
   * string += decoder.decode(); // end-of-queue
   * ```
   *
   * If the error mode is "fatal" and encoding's decoder returns error, throws a TypeError.
   */
  decode(input?: BufferSource, options?: TextDecodeOptions): string;
}

declare const TextDecoder: {
  readonly prototype: TextDecoder;
  new (label?: string, options?: TextDecoderOptions): TextDecoder;
};

interface TextDecoderCommon {
  /** Returns encoding's name, lowercased. */
  readonly encoding: string;
  /** Returns true if error mode is "fatal", otherwise false. */
  readonly fatal: boolean;
  /** Returns the value of ignore BOM. */
  readonly ignoreBOM: boolean;
}

interface TextDecoderStream extends GenericTransformStream, TextDecoderCommon {
  readonly readable: ReadableStream<string>;
  readonly writable: WritableStream<BufferSource>;
}

declare const TextDecoderStream: {
  readonly prototype: TextDecoderStream;
  new (label?: string, options?: TextDecoderOptions): TextDecoderStream;
};

/** TextEncoder takes a stream of code points as input and emits a stream of bytes. For a more scalable, non-native library, see StringView – a C-like representation of strings based on typed arrays. */
interface TextEncoder extends TextEncoderCommon {
  /** Returns the result of running UTF-8's encoder. */
  encode(input?: string): Uint8Array;
  /** Runs the UTF-8 encoder on source, stores the result of that operation into destination, and returns the progress made as an object wherein read is the number of converted code units of source and written is the number of bytes modified in destination. */
  encodeInto(
    source: string,
    destination: Uint8Array
  ): TextEncoderEncodeIntoResult;
}

declare const TextEncoder: {
  readonly prototype: TextEncoder;
  new (): TextEncoder;
};

interface TextEncoderCommon {
  /** Returns "utf-8". */
  readonly encoding: string;
}

interface TextEncoderStream extends GenericTransformStream, TextEncoderCommon {
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<string>;
}

declare const TextEncoderStream: {
  readonly prototype: TextEncoderStream;
  new (): TextEncoderStream;
};

/** The dimensions of a piece of text in the canvas, as created by the CanvasRenderingContext2D.measureText() method. */
interface TextMetrics {
  /** Returns the measurement described below. */
  readonly actualBoundingBoxAscent: number;
  /** Returns the measurement described below. */
  readonly actualBoundingBoxDescent: number;
  /** Returns the measurement described below. */
  readonly actualBoundingBoxLeft: number;
  /** Returns the measurement described below. */
  readonly actualBoundingBoxRight: number;
  /** Returns the measurement described below. */
  readonly fontBoundingBoxAscent: number;
  /** Returns the measurement described below. */
  readonly fontBoundingBoxDescent: number;
  /** Returns the measurement described below. */
  readonly width: number;
}

declare const TextMetrics: {
  readonly prototype: TextMetrics;
  new (): TextMetrics;
};

interface TextTrackEventMap {
  readonly cuechange: Event;
}

/** This interface also inherits properties from EventTarget. */
interface TextTrack extends EventTarget {
  /** Returns the text track cues from the text track list of cues that are currently active (i.e. that start before the current playback position and end after it), as a TextTrackCueList object. */
  readonly activeCues: TextTrackCueList | null;
  /** Returns the text track list of cues, as a TextTrackCueList object. */
  readonly cues: TextTrackCueList | null;
  /**
   * Returns the ID of the given track.
   *
   * For in-band tracks, this is the ID that can be used with a fragment if the format supports media fragment syntax, and that can be used with the getTrackById() method.
   *
   * For TextTrack objects corresponding to track elements, this is the ID of the track element.
   */
  readonly id: string;
  /** Returns the text track in-band metadata track dispatch type string. */
  readonly inBandMetadataTrackDispatchType: string;
  /** Returns the text track kind string. */
  readonly kind: TextTrackKind;
  /** Returns the text track label, if there is one, or the empty string otherwise (indicating that a custom label probably needs to be generated from the other attributes of the object if the object is exposed to the user). */
  readonly label: string;
  /** Returns the text track language string. */
  readonly language: string;
  /**
   * Returns the text track mode, represented by a string from the following list:
   *
   * Can be set, to change the mode.
   */
  readonly mode: TextTrackMode;
  readonly oncuechange: ((this: TextTrack, ev: Event) => unknown) | null;
  /** Adds the given cue to textTrack's text track list of cues. */
  addCue(cue: TextTrackCue): void;
  /** Removes the given cue from textTrack's text track list of cues. */
  removeCue(cue: TextTrackCue): void;
  addEventListener<K extends keyof TextTrackEventMap>(
    type: K,
    listener: (this: TextTrack, ev: TextTrackEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof TextTrackEventMap>(
    type: K,
    listener: (this: TextTrack, ev: TextTrackEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const TextTrack: {
  readonly prototype: TextTrack;
  new (): TextTrack;
};

interface TextTrackCueEventMap {
  readonly enter: Event;
  readonly exit: Event;
}

/** TextTrackCues represent a string of text that will be displayed for some duration of time on a TextTrack. This includes the start and end times that the cue will be displayed. A TextTrackCue cannot be used directly, instead one of the derived types (e.g. VTTCue) must be used. */
interface TextTrackCue extends EventTarget {
  /**
   * Returns the text track cue end time, in seconds.
   *
   * Can be set.
   */
  readonly endTime: number;
  /**
   * Returns the text track cue identifier.
   *
   * Can be set.
   */
  readonly id: string;
  readonly onenter: ((this: TextTrackCue, ev: Event) => unknown) | null;
  readonly onexit: ((this: TextTrackCue, ev: Event) => unknown) | null;
  /**
   * Returns true if the text track cue pause-on-exit flag is set, false otherwise.
   *
   * Can be set.
   */
  readonly pauseOnExit: boolean;
  /**
   * Returns the text track cue start time, in seconds.
   *
   * Can be set.
   */
  readonly startTime: number;
  /** Returns the TextTrack object to which this text track cue belongs, if any, or null otherwise. */
  readonly track: TextTrack | null;
  addEventListener<K extends keyof TextTrackCueEventMap>(
    type: K,
    listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof TextTrackCueEventMap>(
    type: K,
    listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const TextTrackCue: {
  readonly prototype: TextTrackCue;
  new (): TextTrackCue;
};

interface TextTrackCueList {
  /** Returns the number of cues in the list. */
  readonly length: number;
  /**
   * Returns the first text track cue (in text track cue order) with text track cue identifier id.
   *
   * Returns null if none of the cues have the given identifier or if the argument is the empty string.
   */
  getCueById(id: string): TextTrackCue | null;
  readonly [index: number]: TextTrackCue;
}

declare const TextTrackCueList: {
  readonly prototype: TextTrackCueList;
  new (): TextTrackCueList;
};

interface TextTrackListEventMap {
  readonly addtrack: TrackEvent;
  readonly change: Event;
  readonly removetrack: TrackEvent;
}

interface TextTrackList extends EventTarget {
  readonly length: number;
  readonly onaddtrack:
    | ((this: TextTrackList, ev: TrackEvent) => unknown)
    | null;
  readonly onchange: ((this: TextTrackList, ev: Event) => unknown) | null;
  readonly onremovetrack:
    | ((this: TextTrackList, ev: TrackEvent) => unknown)
    | null;
  getTrackById(id: string): TextTrack | null;
  addEventListener<K extends keyof TextTrackListEventMap>(
    type: K,
    listener: (this: TextTrackList, ev: TextTrackListEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof TextTrackListEventMap>(
    type: K,
    listener: (this: TextTrackList, ev: TextTrackListEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  readonly [index: number]: TextTrack;
}

declare const TextTrackList: {
  readonly prototype: TextTrackList;
  new (): TextTrackList;
};

/** Used to represent a set of time ranges, primarily for the purpose of tracking which portions of media have been buffered when loading it for use by the <audio> and <video> elements. */
interface TimeRanges {
  /** Returns the number of ranges in the object. */
  readonly length: number;
  /**
   * Returns the time for the end of the range with the given index.
   *
   * Throws an "IndexSizeError" DOMException if the index is out of range.
   */
  end(index: number): number;
  /**
   * Returns the time for the start of the range with the given index.
   *
   * Throws an "IndexSizeError" DOMException if the index is out of range.
   */
  start(index: number): number;
}

declare const TimeRanges: {
  readonly prototype: TimeRanges;
  new (): TimeRanges;
};

/** A single contact point on a touch-sensitive device. The contact point is commonly a finger or stylus and the device may be a touchscreen or trackpad. */
interface Touch {
  readonly clientX: number;
  readonly clientY: number;
  readonly force: number;
  readonly identifier: number;
  readonly pageX: number;
  readonly pageY: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly rotationAngle: number;
  readonly screenX: number;
  readonly screenY: number;
  readonly target: EventTarget;
}

declare const Touch: {
  readonly prototype: Touch;
  new (touchInitDict: TouchInit): Touch;
};

/** An event sent when the state of contacts with a touch-sensitive surface changes. This surface can be a touch screen or trackpad, for example. The event can describe one or more points of contact with the screen and includes support for detecting movement, addition and removal of contact points, and so forth. */
interface TouchEvent extends UIEvent {
  readonly altKey: boolean;
  readonly changedTouches: TouchList;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly targetTouches: TouchList;
  readonly touches: TouchList;
}

declare const TouchEvent: {
  readonly prototype: TouchEvent;
  new (type: string, eventInitDict?: TouchEventInit): TouchEvent;
};

/** A list of contact points on a touch surface. For example, if the user has three fingers on the touch surface (such as a screen or trackpad), the corresponding TouchList object would have one Touch object for each finger, for a total of three entries. */
interface TouchList {
  readonly length: number;
  item(index: number): Touch | null;
  readonly [index: number]: Touch;
}

declare const TouchList: {
  readonly prototype: TouchList;
  new (): TouchList;
};

/** The TrackEvent interface, part of the HTML DOM specification, is used for events which represent changes to the set of available tracks on an HTML media element; these events are addtrack and removetrack. */
interface TrackEvent extends Event {
  /** Returns the track object (TextTrack, AudioTrack, or VideoTrack) to which the event relates. */
  readonly track: TextTrack | null;
}

declare const TrackEvent: {
  readonly prototype: TrackEvent;
  new (type: string, eventInitDict?: TrackEventInit): TrackEvent;
};

interface TransformStream<I = unknown, O = unknown> {
  readonly readable: ReadableStream<O>;
  readonly writable: WritableStream<I>;
}

declare const TransformStream: {
  readonly prototype: TransformStream;
  new <I = unknown, O = unknown>(
    transformer?: Transformer<I, O>,
    writableStrategy?: QueuingStrategy<I>,
    readableStrategy?: QueuingStrategy<O>
  ): TransformStream<I, O>;
};

interface TransformStreamDefaultController<O = unknown> {
  readonly desiredSize: number | null;
  enqueue(chunk?: O): void;
  error(reason?: unknown): void;
  terminate(): void;
}

declare const TransformStreamDefaultController: {
  readonly prototype: TransformStreamDefaultController;
  new (): TransformStreamDefaultController;
};

/** Events providing information related to transitions. */
interface TransitionEvent extends Event {
  readonly elapsedTime: number;
  readonly propertyName: string;
  readonly pseudoElement: string;
}

declare const TransitionEvent: {
  readonly prototype: TransitionEvent;
  new (
    type: string,
    transitionEventInitDict?: TransitionEventInit
  ): TransitionEvent;
};

/** The nodes of a document subtree and a position within them. */
interface TreeWalker {
  readonly currentNode: Node;
  readonly filter: NodeFilter | null;
  readonly root: Node;
  readonly whatToShow: number;
  firstChild(): Node | null;
  lastChild(): Node | null;
  nextNode(): Node | null;
  nextSibling(): Node | null;
  parentNode(): Node | null;
  previousNode(): Node | null;
  previousSibling(): Node | null;
}

declare const TreeWalker: {
  readonly prototype: TreeWalker;
  new (): TreeWalker;
};

/** Simple user interface events. */
interface UIEvent extends Event {
  readonly detail: number;
  readonly view: Window | null;
  /** @deprecated */
  readonly which: number;
  /** @deprecated */
  initUIEvent(
    typeArg: string,
    bubblesArg?: boolean,
    cancelableArg?: boolean,
    viewArg?: Window | null,
    detailArg?: number
  ): void;
}

declare const UIEvent: {
  readonly prototype: UIEvent;
  new (type: string, eventInitDict?: UIEventInit): UIEvent;
};

/** The URL interface represents an object providing static methods used for creating object URLs. */
interface URL {
  readonly hash: string;
  readonly host: string;
  readonly hostname: string;
  readonly href: string;
  toString(): string;
  readonly origin: string;
  readonly password: string;
  readonly pathname: string;
  readonly port: string;
  readonly protocol: string;
  readonly search: string;
  readonly searchParams: URLSearchParams;
  readonly username: string;
  toJSON(): string;
}

declare const URL: {
  readonly prototype: URL;
  new (url: string | URL, base?: string | URL): URL;
  createObjectURL(obj: Blob | MediaSource): string;
  revokeObjectURL(url: string): void;
};

type webkitURL = URL;
declare const webkitURL: typeof URL;

interface URLSearchParams {
  /** Appends a specified key/value pair as a new search parameter. */
  append(name: string, value: string): void;
  /** Deletes the given search parameter, and its associated value, from the list of all search parameters. */
  delete(name: string): void;
  /** Returns the first value associated to the given search parameter. */
  get(name: string): string | null;
  /** Returns all the values association with a given search parameter. */
  getAll(name: string): readonly string[];
  /** Returns a Boolean indicating if such a search parameter exists. */
  has(name: string): boolean;
  /** Sets the value associated to a given search parameter to the given value. If there were several values, delete the others. */
  set(name: string, value: string): void;
  sort(): void;
  /** Returns a string containing a query string suitable for use in a URL. Does not include the question mark. */
  toString(): string;
  forEach(
    callbackfn: (value: string, key: string, parent: URLSearchParams) => void,
    thisArg?: unknown
  ): void;
}

declare const URLSearchParams: {
  readonly prototype: URLSearchParams;
  new (
    init?:
      | readonly (readonly string[])[]
      | Record<string, string>
      | string
      | URLSearchParams
  ): URLSearchParams;
  toString(): string;
};

interface VTTCue extends TextTrackCue {
  readonly align: AlignSetting;
  readonly line: LineAndPositionSetting;
  readonly lineAlign: LineAlignSetting;
  readonly position: LineAndPositionSetting;
  readonly positionAlign: PositionAlignSetting;
  readonly region: VTTRegion | null;
  readonly size: number;
  readonly snapToLines: boolean;
  readonly text: string;
  readonly vertical: DirectionSetting;
  getCueAsHTML(): DocumentFragment;
  addEventListener<K extends keyof TextTrackCueEventMap>(
    type: K,
    listener: (this: VTTCue, ev: TextTrackCueEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof TextTrackCueEventMap>(
    type: K,
    listener: (this: VTTCue, ev: TextTrackCueEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const VTTCue: {
  readonly prototype: VTTCue;
  new (startTime: number, endTime: number, text: string): VTTCue;
};

interface VTTRegion {
  readonly id: string;
  readonly lines: number;
  readonly regionAnchorX: number;
  readonly regionAnchorY: number;
  readonly scroll: ScrollSetting;
  readonly viewportAnchorX: number;
  readonly viewportAnchorY: number;
  readonly width: number;
}

declare const VTTRegion: {
  readonly prototype: VTTRegion;
  new (): VTTRegion;
};

/** The validity states that an element can be in, with respect to constraint validation. Together, they help explain why an element's value fails to validate, if it's not valid. */
interface ValidityState {
  readonly badInput: boolean;
  readonly customError: boolean;
  readonly patternMismatch: boolean;
  readonly rangeOverflow: boolean;
  readonly rangeUnderflow: boolean;
  readonly stepMismatch: boolean;
  readonly tooLong: boolean;
  readonly tooShort: boolean;
  readonly typeMismatch: boolean;
  readonly valid: boolean;
  readonly valueMissing: boolean;
}

declare const ValidityState: {
  readonly prototype: ValidityState;
  new (): ValidityState;
};

interface VideoColorSpace {
  readonly fullRange: boolean | null;
  readonly matrix: VideoMatrixCoefficients | null;
  readonly primaries: VideoColorPrimaries | null;
  readonly transfer: VideoTransferCharacteristics | null;
  toJSON(): VideoColorSpaceInit;
}

declare const VideoColorSpace: {
  readonly prototype: VideoColorSpace;
  new (init?: VideoColorSpaceInit): VideoColorSpace;
};

/** Returned by the HTMLVideoElement.getVideoPlaybackQuality() method and contains metrics that can be used to determine the playback quality of a video. */
interface VideoPlaybackQuality {
  /** @deprecated */
  readonly corruptedVideoFrames: number;
  readonly creationTime: DOMHighResTimeStamp;
  readonly droppedVideoFrames: number;
  readonly totalVideoFrames: number;
}

declare const VideoPlaybackQuality: {
  readonly prototype: VideoPlaybackQuality;
  new (): VideoPlaybackQuality;
};

interface VisualViewportEventMap {
  readonly resize: Event;
  readonly scroll: Event;
}

interface VisualViewport extends EventTarget {
  readonly height: number;
  readonly offsetLeft: number;
  readonly offsetTop: number;
  readonly onresize: ((this: VisualViewport, ev: Event) => unknown) | null;
  readonly onscroll: ((this: VisualViewport, ev: Event) => unknown) | null;
  readonly pageLeft: number;
  readonly pageTop: number;
  readonly scale: number;
  readonly width: number;
  addEventListener<K extends keyof VisualViewportEventMap>(
    type: K,
    listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof VisualViewportEventMap>(
    type: K,
    listener: (this: VisualViewport, ev: VisualViewportEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const VisualViewport: {
  readonly prototype: VisualViewport;
  new (): VisualViewport;
};

interface WEBGL_color_buffer_float {
  readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: GLenum;
  readonly RGBA32F_EXT: GLenum;
  readonly UNSIGNED_NORMALIZED_EXT: GLenum;
}

interface WEBGL_compressed_texture_astc {
  getSupportedProfiles(): readonly string[];
  readonly COMPRESSED_RGBA_ASTC_10x10_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_10x5_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_10x6_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_10x8_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_12x10_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_12x12_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_4x4_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_5x4_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_5x5_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_6x5_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_6x6_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_8x5_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_8x6_KHR: GLenum;
  readonly COMPRESSED_RGBA_ASTC_8x8_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR: GLenum;
}

interface WEBGL_compressed_texture_etc {
  readonly COMPRESSED_R11_EAC: GLenum;
  readonly COMPRESSED_RG11_EAC: GLenum;
  readonly COMPRESSED_RGB8_ETC2: GLenum;
  readonly COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: GLenum;
  readonly COMPRESSED_RGBA8_ETC2_EAC: GLenum;
  readonly COMPRESSED_SIGNED_R11_EAC: GLenum;
  readonly COMPRESSED_SIGNED_RG11_EAC: GLenum;
  readonly COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: GLenum;
  readonly COMPRESSED_SRGB8_ETC2: GLenum;
  readonly COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: GLenum;
}

interface WEBGL_compressed_texture_etc1 {
  readonly COMPRESSED_RGB_ETC1_WEBGL: GLenum;
}

/** The WEBGL_compressed_texture_s3tc extension is part of the WebGL API and exposes four S3TC compressed texture formats. */
interface WEBGL_compressed_texture_s3tc {
  readonly COMPRESSED_RGBA_S3TC_DXT1_EXT: GLenum;
  readonly COMPRESSED_RGBA_S3TC_DXT3_EXT: GLenum;
  readonly COMPRESSED_RGBA_S3TC_DXT5_EXT: GLenum;
  readonly COMPRESSED_RGB_S3TC_DXT1_EXT: GLenum;
}

interface WEBGL_compressed_texture_s3tc_srgb {
  readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: GLenum;
  readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT: GLenum;
  readonly COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: GLenum;
  readonly COMPRESSED_SRGB_S3TC_DXT1_EXT: GLenum;
}

/** The WEBGL_debug_renderer_info extension is part of the WebGL API and exposes two constants with information about the graphics driver for debugging purposes. */
interface WEBGL_debug_renderer_info {
  readonly UNMASKED_RENDERER_WEBGL: GLenum;
  readonly UNMASKED_VENDOR_WEBGL: GLenum;
}

interface WEBGL_debug_shaders {
  getTranslatedShaderSource(shader: WebGLShader): string;
}

/** The WEBGL_depth_texture extension is part of the WebGL API and defines 2D depth and depth-stencil textures. */
interface WEBGL_depth_texture {
  readonly UNSIGNED_INT_24_8_WEBGL: GLenum;
}

interface WEBGL_draw_buffers {
  drawBuffersWEBGL(buffers: readonly GLenum[]): void;
  readonly COLOR_ATTACHMENT0_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT10_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT11_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT12_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT13_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT14_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT15_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT1_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT2_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT3_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT4_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT5_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT6_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT7_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT8_WEBGL: GLenum;
  readonly COLOR_ATTACHMENT9_WEBGL: GLenum;
  readonly DRAW_BUFFER0_WEBGL: GLenum;
  readonly DRAW_BUFFER10_WEBGL: GLenum;
  readonly DRAW_BUFFER11_WEBGL: GLenum;
  readonly DRAW_BUFFER12_WEBGL: GLenum;
  readonly DRAW_BUFFER13_WEBGL: GLenum;
  readonly DRAW_BUFFER14_WEBGL: GLenum;
  readonly DRAW_BUFFER15_WEBGL: GLenum;
  readonly DRAW_BUFFER1_WEBGL: GLenum;
  readonly DRAW_BUFFER2_WEBGL: GLenum;
  readonly DRAW_BUFFER3_WEBGL: GLenum;
  readonly DRAW_BUFFER4_WEBGL: GLenum;
  readonly DRAW_BUFFER5_WEBGL: GLenum;
  readonly DRAW_BUFFER6_WEBGL: GLenum;
  readonly DRAW_BUFFER7_WEBGL: GLenum;
  readonly DRAW_BUFFER8_WEBGL: GLenum;
  readonly DRAW_BUFFER9_WEBGL: GLenum;
  readonly MAX_COLOR_ATTACHMENTS_WEBGL: GLenum;
  readonly MAX_DRAW_BUFFERS_WEBGL: GLenum;
}

interface WEBGL_lose_context {
  loseContext(): void;
  restoreContext(): void;
}

interface WEBGL_multi_draw {
  multiDrawArraysInstancedWEBGL(
    mode: GLenum,
    firstsList: Int32Array | readonly GLint[],
    firstsOffset: GLuint,
    countsList: Int32Array | readonly GLsizei[],
    countsOffset: GLuint,
    instanceCountsList: Int32Array | readonly GLsizei[],
    instanceCountsOffset: GLuint,
    drawcount: GLsizei
  ): void;
  multiDrawArraysWEBGL(
    mode: GLenum,
    firstsList: Int32Array | readonly GLint[],
    firstsOffset: GLuint,
    countsList: Int32Array | readonly GLsizei[],
    countsOffset: GLuint,
    drawcount: GLsizei
  ): void;
  multiDrawElementsInstancedWEBGL(
    mode: GLenum,
    countsList: Int32Array | readonly GLint[],
    countsOffset: GLuint,
    type: GLenum,
    offsetsList: Int32Array | readonly GLsizei[],
    offsetsOffset: GLuint,
    instanceCountsList: Int32Array | readonly GLsizei[],
    instanceCountsOffset: GLuint,
    drawcount: GLsizei
  ): void;
  multiDrawElementsWEBGL(
    mode: GLenum,
    countsList: Int32Array | readonly GLint[],
    countsOffset: GLuint,
    type: GLenum,
    offsetsList: Int32Array | readonly GLsizei[],
    offsetsOffset: GLuint,
    drawcount: GLsizei
  ): void;
}

/** A WaveShaperNode always has exactly one input and one output. */
interface WaveShaperNode extends AudioNode {
  readonly curve: Float32Array | null;
  readonly oversample: OverSampleType;
}

declare const WaveShaperNode: {
  readonly prototype: WaveShaperNode;
  new (context: BaseAudioContext, options?: WaveShaperOptions): WaveShaperNode;
};

interface WebGL2RenderingContext
  extends WebGL2RenderingContextBase,
    WebGL2RenderingContextOverloads,
    WebGLRenderingContextBase {}

declare const WebGL2RenderingContext: {
  readonly prototype: WebGL2RenderingContext;
  new (): WebGL2RenderingContext;
  readonly ACTIVE_UNIFORM_BLOCKS: GLenum;
  readonly ALREADY_SIGNALED: GLenum;
  readonly ANY_SAMPLES_PASSED: GLenum;
  readonly ANY_SAMPLES_PASSED_CONSERVATIVE: GLenum;
  readonly COLOR: GLenum;
  readonly COLOR_ATTACHMENT1: GLenum;
  readonly COLOR_ATTACHMENT10: GLenum;
  readonly COLOR_ATTACHMENT11: GLenum;
  readonly COLOR_ATTACHMENT12: GLenum;
  readonly COLOR_ATTACHMENT13: GLenum;
  readonly COLOR_ATTACHMENT14: GLenum;
  readonly COLOR_ATTACHMENT15: GLenum;
  readonly COLOR_ATTACHMENT2: GLenum;
  readonly COLOR_ATTACHMENT3: GLenum;
  readonly COLOR_ATTACHMENT4: GLenum;
  readonly COLOR_ATTACHMENT5: GLenum;
  readonly COLOR_ATTACHMENT6: GLenum;
  readonly COLOR_ATTACHMENT7: GLenum;
  readonly COLOR_ATTACHMENT8: GLenum;
  readonly COLOR_ATTACHMENT9: GLenum;
  readonly COMPARE_REF_TO_TEXTURE: GLenum;
  readonly CONDITION_SATISFIED: GLenum;
  readonly COPY_READ_BUFFER: GLenum;
  readonly COPY_READ_BUFFER_BINDING: GLenum;
  readonly COPY_WRITE_BUFFER: GLenum;
  readonly COPY_WRITE_BUFFER_BINDING: GLenum;
  readonly CURRENT_QUERY: GLenum;
  readonly DEPTH: GLenum;
  readonly DEPTH24_STENCIL8: GLenum;
  readonly DEPTH32F_STENCIL8: GLenum;
  readonly DEPTH_COMPONENT24: GLenum;
  readonly DEPTH_COMPONENT32F: GLenum;
  readonly DRAW_BUFFER0: GLenum;
  readonly DRAW_BUFFER1: GLenum;
  readonly DRAW_BUFFER10: GLenum;
  readonly DRAW_BUFFER11: GLenum;
  readonly DRAW_BUFFER12: GLenum;
  readonly DRAW_BUFFER13: GLenum;
  readonly DRAW_BUFFER14: GLenum;
  readonly DRAW_BUFFER15: GLenum;
  readonly DRAW_BUFFER2: GLenum;
  readonly DRAW_BUFFER3: GLenum;
  readonly DRAW_BUFFER4: GLenum;
  readonly DRAW_BUFFER5: GLenum;
  readonly DRAW_BUFFER6: GLenum;
  readonly DRAW_BUFFER7: GLenum;
  readonly DRAW_BUFFER8: GLenum;
  readonly DRAW_BUFFER9: GLenum;
  readonly DRAW_FRAMEBUFFER: GLenum;
  readonly DRAW_FRAMEBUFFER_BINDING: GLenum;
  readonly DYNAMIC_COPY: GLenum;
  readonly DYNAMIC_READ: GLenum;
  readonly FLOAT_32_UNSIGNED_INT_24_8_REV: GLenum;
  readonly FLOAT_MAT2x3: GLenum;
  readonly FLOAT_MAT2x4: GLenum;
  readonly FLOAT_MAT3x2: GLenum;
  readonly FLOAT_MAT3x4: GLenum;
  readonly FLOAT_MAT4x2: GLenum;
  readonly FLOAT_MAT4x3: GLenum;
  readonly FRAGMENT_SHADER_DERIVATIVE_HINT: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: GLenum;
  readonly FRAMEBUFFER_DEFAULT: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: GLenum;
  readonly HALF_FLOAT: GLenum;
  readonly INTERLEAVED_ATTRIBS: GLenum;
  readonly INT_2_10_10_10_REV: GLenum;
  readonly INT_SAMPLER_2D: GLenum;
  readonly INT_SAMPLER_2D_ARRAY: GLenum;
  readonly INT_SAMPLER_3D: GLenum;
  readonly INT_SAMPLER_CUBE: GLenum;
  readonly INVALID_INDEX: GLenum;
  readonly MAX: GLenum;
  readonly MAX_3D_TEXTURE_SIZE: GLenum;
  readonly MAX_ARRAY_TEXTURE_LAYERS: GLenum;
  readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: GLenum;
  readonly MAX_COLOR_ATTACHMENTS: GLenum;
  readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: GLenum;
  readonly MAX_COMBINED_UNIFORM_BLOCKS: GLenum;
  readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: GLenum;
  readonly MAX_DRAW_BUFFERS: GLenum;
  readonly MAX_ELEMENTS_INDICES: GLenum;
  readonly MAX_ELEMENTS_VERTICES: GLenum;
  readonly MAX_ELEMENT_INDEX: GLenum;
  readonly MAX_FRAGMENT_INPUT_COMPONENTS: GLenum;
  readonly MAX_FRAGMENT_UNIFORM_BLOCKS: GLenum;
  readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: GLenum;
  readonly MAX_PROGRAM_TEXEL_OFFSET: GLenum;
  readonly MAX_SAMPLES: GLenum;
  readonly MAX_SERVER_WAIT_TIMEOUT: GLenum;
  readonly MAX_TEXTURE_LOD_BIAS: GLenum;
  readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: GLenum;
  readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: GLenum;
  readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: GLenum;
  readonly MAX_UNIFORM_BLOCK_SIZE: GLenum;
  readonly MAX_UNIFORM_BUFFER_BINDINGS: GLenum;
  readonly MAX_VARYING_COMPONENTS: GLenum;
  readonly MAX_VERTEX_OUTPUT_COMPONENTS: GLenum;
  readonly MAX_VERTEX_UNIFORM_BLOCKS: GLenum;
  readonly MAX_VERTEX_UNIFORM_COMPONENTS: GLenum;
  readonly MIN: GLenum;
  readonly MIN_PROGRAM_TEXEL_OFFSET: GLenum;
  readonly OBJECT_TYPE: GLenum;
  readonly PACK_ROW_LENGTH: GLenum;
  readonly PACK_SKIP_PIXELS: GLenum;
  readonly PACK_SKIP_ROWS: GLenum;
  readonly PIXEL_PACK_BUFFER: GLenum;
  readonly PIXEL_PACK_BUFFER_BINDING: GLenum;
  readonly PIXEL_UNPACK_BUFFER: GLenum;
  readonly PIXEL_UNPACK_BUFFER_BINDING: GLenum;
  readonly QUERY_RESULT: GLenum;
  readonly QUERY_RESULT_AVAILABLE: GLenum;
  readonly R11F_G11F_B10F: GLenum;
  readonly R16F: GLenum;
  readonly R16I: GLenum;
  readonly R16UI: GLenum;
  readonly R32F: GLenum;
  readonly R32I: GLenum;
  readonly R32UI: GLenum;
  readonly R8: GLenum;
  readonly R8I: GLenum;
  readonly R8UI: GLenum;
  readonly R8_SNORM: GLenum;
  readonly RASTERIZER_DISCARD: GLenum;
  readonly READ_BUFFER: GLenum;
  readonly READ_FRAMEBUFFER: GLenum;
  readonly READ_FRAMEBUFFER_BINDING: GLenum;
  readonly RED: GLenum;
  readonly RED_INTEGER: GLenum;
  readonly RENDERBUFFER_SAMPLES: GLenum;
  readonly RG: GLenum;
  readonly RG16F: GLenum;
  readonly RG16I: GLenum;
  readonly RG16UI: GLenum;
  readonly RG32F: GLenum;
  readonly RG32I: GLenum;
  readonly RG32UI: GLenum;
  readonly RG8: GLenum;
  readonly RG8I: GLenum;
  readonly RG8UI: GLenum;
  readonly RG8_SNORM: GLenum;
  readonly RGB10_A2: GLenum;
  readonly RGB10_A2UI: GLenum;
  readonly RGB16F: GLenum;
  readonly RGB16I: GLenum;
  readonly RGB16UI: GLenum;
  readonly RGB32F: GLenum;
  readonly RGB32I: GLenum;
  readonly RGB32UI: GLenum;
  readonly RGB8: GLenum;
  readonly RGB8I: GLenum;
  readonly RGB8UI: GLenum;
  readonly RGB8_SNORM: GLenum;
  readonly RGB9_E5: GLenum;
  readonly RGBA16F: GLenum;
  readonly RGBA16I: GLenum;
  readonly RGBA16UI: GLenum;
  readonly RGBA32F: GLenum;
  readonly RGBA32I: GLenum;
  readonly RGBA32UI: GLenum;
  readonly RGBA8: GLenum;
  readonly RGBA8I: GLenum;
  readonly RGBA8UI: GLenum;
  readonly RGBA8_SNORM: GLenum;
  readonly RGBA_INTEGER: GLenum;
  readonly RGB_INTEGER: GLenum;
  readonly RG_INTEGER: GLenum;
  readonly SAMPLER_2D_ARRAY: GLenum;
  readonly SAMPLER_2D_ARRAY_SHADOW: GLenum;
  readonly SAMPLER_2D_SHADOW: GLenum;
  readonly SAMPLER_3D: GLenum;
  readonly SAMPLER_BINDING: GLenum;
  readonly SAMPLER_CUBE_SHADOW: GLenum;
  readonly SEPARATE_ATTRIBS: GLenum;
  readonly SIGNALED: GLenum;
  readonly SIGNED_NORMALIZED: GLenum;
  readonly SRGB: GLenum;
  readonly SRGB8: GLenum;
  readonly SRGB8_ALPHA8: GLenum;
  readonly STATIC_COPY: GLenum;
  readonly STATIC_READ: GLenum;
  readonly STENCIL: GLenum;
  readonly STREAM_COPY: GLenum;
  readonly STREAM_READ: GLenum;
  readonly SYNC_CONDITION: GLenum;
  readonly SYNC_FENCE: GLenum;
  readonly SYNC_FLAGS: GLenum;
  readonly SYNC_FLUSH_COMMANDS_BIT: GLenum;
  readonly SYNC_GPU_COMMANDS_COMPLETE: GLenum;
  readonly SYNC_STATUS: GLenum;
  readonly TEXTURE_2D_ARRAY: GLenum;
  readonly TEXTURE_3D: GLenum;
  readonly TEXTURE_BASE_LEVEL: GLenum;
  readonly TEXTURE_BINDING_2D_ARRAY: GLenum;
  readonly TEXTURE_BINDING_3D: GLenum;
  readonly TEXTURE_COMPARE_FUNC: GLenum;
  readonly TEXTURE_COMPARE_MODE: GLenum;
  readonly TEXTURE_IMMUTABLE_FORMAT: GLenum;
  readonly TEXTURE_IMMUTABLE_LEVELS: GLenum;
  readonly TEXTURE_MAX_LEVEL: GLenum;
  readonly TEXTURE_MAX_LOD: GLenum;
  readonly TEXTURE_MIN_LOD: GLenum;
  readonly TEXTURE_WRAP_R: GLenum;
  readonly TIMEOUT_EXPIRED: GLenum;
  readonly TIMEOUT_IGNORED: GLint64;
  readonly TRANSFORM_FEEDBACK: GLenum;
  readonly TRANSFORM_FEEDBACK_ACTIVE: GLenum;
  readonly TRANSFORM_FEEDBACK_BINDING: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER_MODE: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER_START: GLenum;
  readonly TRANSFORM_FEEDBACK_PAUSED: GLenum;
  readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: GLenum;
  readonly TRANSFORM_FEEDBACK_VARYINGS: GLenum;
  readonly UNIFORM_ARRAY_STRIDE: GLenum;
  readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: GLenum;
  readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: GLenum;
  readonly UNIFORM_BLOCK_BINDING: GLenum;
  readonly UNIFORM_BLOCK_DATA_SIZE: GLenum;
  readonly UNIFORM_BLOCK_INDEX: GLenum;
  readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: GLenum;
  readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: GLenum;
  readonly UNIFORM_BUFFER: GLenum;
  readonly UNIFORM_BUFFER_BINDING: GLenum;
  readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: GLenum;
  readonly UNIFORM_BUFFER_SIZE: GLenum;
  readonly UNIFORM_BUFFER_START: GLenum;
  readonly UNIFORM_IS_ROW_MAJOR: GLenum;
  readonly UNIFORM_MATRIX_STRIDE: GLenum;
  readonly UNIFORM_OFFSET: GLenum;
  readonly UNIFORM_SIZE: GLenum;
  readonly UNIFORM_TYPE: GLenum;
  readonly UNPACK_IMAGE_HEIGHT: GLenum;
  readonly UNPACK_ROW_LENGTH: GLenum;
  readonly UNPACK_SKIP_IMAGES: GLenum;
  readonly UNPACK_SKIP_PIXELS: GLenum;
  readonly UNPACK_SKIP_ROWS: GLenum;
  readonly UNSIGNALED: GLenum;
  readonly UNSIGNED_INT_10F_11F_11F_REV: GLenum;
  readonly UNSIGNED_INT_24_8: GLenum;
  readonly UNSIGNED_INT_2_10_10_10_REV: GLenum;
  readonly UNSIGNED_INT_5_9_9_9_REV: GLenum;
  readonly UNSIGNED_INT_SAMPLER_2D: GLenum;
  readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: GLenum;
  readonly UNSIGNED_INT_SAMPLER_3D: GLenum;
  readonly UNSIGNED_INT_SAMPLER_CUBE: GLenum;
  readonly UNSIGNED_INT_VEC2: GLenum;
  readonly UNSIGNED_INT_VEC3: GLenum;
  readonly UNSIGNED_INT_VEC4: GLenum;
  readonly UNSIGNED_NORMALIZED: GLenum;
  readonly VERTEX_ARRAY_BINDING: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_DIVISOR: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_INTEGER: GLenum;
  readonly WAIT_FAILED: GLenum;
  readonly ACTIVE_ATTRIBUTES: GLenum;
  readonly ACTIVE_TEXTURE: GLenum;
  readonly ACTIVE_UNIFORMS: GLenum;
  readonly ALIASED_LINE_WIDTH_RANGE: GLenum;
  readonly ALIASED_POINT_SIZE_RANGE: GLenum;
  readonly ALPHA: GLenum;
  readonly ALPHA_BITS: GLenum;
  readonly ALWAYS: GLenum;
  readonly ARRAY_BUFFER: GLenum;
  readonly ARRAY_BUFFER_BINDING: GLenum;
  readonly ATTACHED_SHADERS: GLenum;
  readonly BACK: GLenum;
  readonly BLEND: GLenum;
  readonly BLEND_COLOR: GLenum;
  readonly BLEND_DST_ALPHA: GLenum;
  readonly BLEND_DST_RGB: GLenum;
  readonly BLEND_EQUATION: GLenum;
  readonly BLEND_EQUATION_ALPHA: GLenum;
  readonly BLEND_EQUATION_RGB: GLenum;
  readonly BLEND_SRC_ALPHA: GLenum;
  readonly BLEND_SRC_RGB: GLenum;
  readonly BLUE_BITS: GLenum;
  readonly BOOL: GLenum;
  readonly BOOL_VEC2: GLenum;
  readonly BOOL_VEC3: GLenum;
  readonly BOOL_VEC4: GLenum;
  readonly BROWSER_DEFAULT_WEBGL: GLenum;
  readonly BUFFER_SIZE: GLenum;
  readonly BUFFER_USAGE: GLenum;
  readonly BYTE: GLenum;
  readonly CCW: GLenum;
  readonly CLAMP_TO_EDGE: GLenum;
  readonly COLOR_ATTACHMENT0: GLenum;
  readonly COLOR_BUFFER_BIT: GLenum;
  readonly COLOR_CLEAR_VALUE: GLenum;
  readonly COLOR_WRITEMASK: GLenum;
  readonly COMPILE_STATUS: GLenum;
  readonly COMPRESSED_TEXTURE_FORMATS: GLenum;
  readonly CONSTANT_ALPHA: GLenum;
  readonly CONSTANT_COLOR: GLenum;
  readonly CONTEXT_LOST_WEBGL: GLenum;
  readonly CULL_FACE: GLenum;
  readonly CULL_FACE_MODE: GLenum;
  readonly CURRENT_PROGRAM: GLenum;
  readonly CURRENT_VERTEX_ATTRIB: GLenum;
  readonly CW: GLenum;
  readonly DECR: GLenum;
  readonly DECR_WRAP: GLenum;
  readonly DELETE_STATUS: GLenum;
  readonly DEPTH_ATTACHMENT: GLenum;
  readonly DEPTH_BITS: GLenum;
  readonly DEPTH_BUFFER_BIT: GLenum;
  readonly DEPTH_CLEAR_VALUE: GLenum;
  readonly DEPTH_COMPONENT: GLenum;
  readonly DEPTH_COMPONENT16: GLenum;
  readonly DEPTH_FUNC: GLenum;
  readonly DEPTH_RANGE: GLenum;
  readonly DEPTH_STENCIL: GLenum;
  readonly DEPTH_STENCIL_ATTACHMENT: GLenum;
  readonly DEPTH_TEST: GLenum;
  readonly DEPTH_WRITEMASK: GLenum;
  readonly DITHER: GLenum;
  readonly DONT_CARE: GLenum;
  readonly DST_ALPHA: GLenum;
  readonly DST_COLOR: GLenum;
  readonly DYNAMIC_DRAW: GLenum;
  readonly ELEMENT_ARRAY_BUFFER: GLenum;
  readonly ELEMENT_ARRAY_BUFFER_BINDING: GLenum;
  readonly EQUAL: GLenum;
  readonly FASTEST: GLenum;
  readonly FLOAT: GLenum;
  readonly FLOAT_MAT2: GLenum;
  readonly FLOAT_MAT3: GLenum;
  readonly FLOAT_MAT4: GLenum;
  readonly FLOAT_VEC2: GLenum;
  readonly FLOAT_VEC3: GLenum;
  readonly FLOAT_VEC4: GLenum;
  readonly FRAGMENT_SHADER: GLenum;
  readonly FRAMEBUFFER: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: GLenum;
  readonly FRAMEBUFFER_BINDING: GLenum;
  readonly FRAMEBUFFER_COMPLETE: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_ATTACHMENT: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_DIMENSIONS: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: GLenum;
  readonly FRAMEBUFFER_UNSUPPORTED: GLenum;
  readonly FRONT: GLenum;
  readonly FRONT_AND_BACK: GLenum;
  readonly FRONT_FACE: GLenum;
  readonly FUNC_ADD: GLenum;
  readonly FUNC_REVERSE_SUBTRACT: GLenum;
  readonly FUNC_SUBTRACT: GLenum;
  readonly GENERATE_MIPMAP_HINT: GLenum;
  readonly GEQUAL: GLenum;
  readonly GREATER: GLenum;
  readonly GREEN_BITS: GLenum;
  readonly HIGH_FLOAT: GLenum;
  readonly HIGH_INT: GLenum;
  readonly IMPLEMENTATION_COLOR_READ_FORMAT: GLenum;
  readonly IMPLEMENTATION_COLOR_READ_TYPE: GLenum;
  readonly INCR: GLenum;
  readonly INCR_WRAP: GLenum;
  readonly INT: GLenum;
  readonly INT_VEC2: GLenum;
  readonly INT_VEC3: GLenum;
  readonly INT_VEC4: GLenum;
  readonly INVALID_ENUM: GLenum;
  readonly INVALID_FRAMEBUFFER_OPERATION: GLenum;
  readonly INVALID_OPERATION: GLenum;
  readonly INVALID_VALUE: GLenum;
  readonly INVERT: GLenum;
  readonly KEEP: GLenum;
  readonly LEQUAL: GLenum;
  readonly LESS: GLenum;
  readonly LINEAR: GLenum;
  readonly LINEAR_MIPMAP_LINEAR: GLenum;
  readonly LINEAR_MIPMAP_NEAREST: GLenum;
  readonly LINES: GLenum;
  readonly LINE_LOOP: GLenum;
  readonly LINE_STRIP: GLenum;
  readonly LINE_WIDTH: GLenum;
  readonly LINK_STATUS: GLenum;
  readonly LOW_FLOAT: GLenum;
  readonly LOW_INT: GLenum;
  readonly LUMINANCE: GLenum;
  readonly LUMINANCE_ALPHA: GLenum;
  readonly MAX_COMBINED_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_CUBE_MAP_TEXTURE_SIZE: GLenum;
  readonly MAX_FRAGMENT_UNIFORM_VECTORS: GLenum;
  readonly MAX_RENDERBUFFER_SIZE: GLenum;
  readonly MAX_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_TEXTURE_SIZE: GLenum;
  readonly MAX_VARYING_VECTORS: GLenum;
  readonly MAX_VERTEX_ATTRIBS: GLenum;
  readonly MAX_VERTEX_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_VERTEX_UNIFORM_VECTORS: GLenum;
  readonly MAX_VIEWPORT_DIMS: GLenum;
  readonly MEDIUM_FLOAT: GLenum;
  readonly MEDIUM_INT: GLenum;
  readonly MIRRORED_REPEAT: GLenum;
  readonly NEAREST: GLenum;
  readonly NEAREST_MIPMAP_LINEAR: GLenum;
  readonly NEAREST_MIPMAP_NEAREST: GLenum;
  readonly NEVER: GLenum;
  readonly NICEST: GLenum;
  readonly NONE: GLenum;
  readonly NOTEQUAL: GLenum;
  readonly NO_ERROR: GLenum;
  readonly ONE: GLenum;
  readonly ONE_MINUS_CONSTANT_ALPHA: GLenum;
  readonly ONE_MINUS_CONSTANT_COLOR: GLenum;
  readonly ONE_MINUS_DST_ALPHA: GLenum;
  readonly ONE_MINUS_DST_COLOR: GLenum;
  readonly ONE_MINUS_SRC_ALPHA: GLenum;
  readonly ONE_MINUS_SRC_COLOR: GLenum;
  readonly OUT_OF_MEMORY: GLenum;
  readonly PACK_ALIGNMENT: GLenum;
  readonly POINTS: GLenum;
  readonly POLYGON_OFFSET_FACTOR: GLenum;
  readonly POLYGON_OFFSET_FILL: GLenum;
  readonly POLYGON_OFFSET_UNITS: GLenum;
  readonly RED_BITS: GLenum;
  readonly RENDERBUFFER: GLenum;
  readonly RENDERBUFFER_ALPHA_SIZE: GLenum;
  readonly RENDERBUFFER_BINDING: GLenum;
  readonly RENDERBUFFER_BLUE_SIZE: GLenum;
  readonly RENDERBUFFER_DEPTH_SIZE: GLenum;
  readonly RENDERBUFFER_GREEN_SIZE: GLenum;
  readonly RENDERBUFFER_HEIGHT: GLenum;
  readonly RENDERBUFFER_INTERNAL_FORMAT: GLenum;
  readonly RENDERBUFFER_RED_SIZE: GLenum;
  readonly RENDERBUFFER_STENCIL_SIZE: GLenum;
  readonly RENDERBUFFER_WIDTH: GLenum;
  readonly RENDERER: GLenum;
  readonly REPEAT: GLenum;
  readonly REPLACE: GLenum;
  readonly RGB: GLenum;
  readonly RGB565: GLenum;
  readonly RGB5_A1: GLenum;
  readonly RGBA: GLenum;
  readonly RGBA4: GLenum;
  readonly SAMPLER_2D: GLenum;
  readonly SAMPLER_CUBE: GLenum;
  readonly SAMPLES: GLenum;
  readonly SAMPLE_ALPHA_TO_COVERAGE: GLenum;
  readonly SAMPLE_BUFFERS: GLenum;
  readonly SAMPLE_COVERAGE: GLenum;
  readonly SAMPLE_COVERAGE_INVERT: GLenum;
  readonly SAMPLE_COVERAGE_VALUE: GLenum;
  readonly SCISSOR_BOX: GLenum;
  readonly SCISSOR_TEST: GLenum;
  readonly SHADER_TYPE: GLenum;
  readonly SHADING_LANGUAGE_VERSION: GLenum;
  readonly SHORT: GLenum;
  readonly SRC_ALPHA: GLenum;
  readonly SRC_ALPHA_SATURATE: GLenum;
  readonly SRC_COLOR: GLenum;
  readonly STATIC_DRAW: GLenum;
  readonly STENCIL_ATTACHMENT: GLenum;
  readonly STENCIL_BACK_FAIL: GLenum;
  readonly STENCIL_BACK_FUNC: GLenum;
  readonly STENCIL_BACK_PASS_DEPTH_FAIL: GLenum;
  readonly STENCIL_BACK_PASS_DEPTH_PASS: GLenum;
  readonly STENCIL_BACK_REF: GLenum;
  readonly STENCIL_BACK_VALUE_MASK: GLenum;
  readonly STENCIL_BACK_WRITEMASK: GLenum;
  readonly STENCIL_BITS: GLenum;
  readonly STENCIL_BUFFER_BIT: GLenum;
  readonly STENCIL_CLEAR_VALUE: GLenum;
  readonly STENCIL_FAIL: GLenum;
  readonly STENCIL_FUNC: GLenum;
  readonly STENCIL_INDEX8: GLenum;
  readonly STENCIL_PASS_DEPTH_FAIL: GLenum;
  readonly STENCIL_PASS_DEPTH_PASS: GLenum;
  readonly STENCIL_REF: GLenum;
  readonly STENCIL_TEST: GLenum;
  readonly STENCIL_VALUE_MASK: GLenum;
  readonly STENCIL_WRITEMASK: GLenum;
  readonly STREAM_DRAW: GLenum;
  readonly SUBPIXEL_BITS: GLenum;
  readonly TEXTURE: GLenum;
  readonly TEXTURE0: GLenum;
  readonly TEXTURE1: GLenum;
  readonly TEXTURE10: GLenum;
  readonly TEXTURE11: GLenum;
  readonly TEXTURE12: GLenum;
  readonly TEXTURE13: GLenum;
  readonly TEXTURE14: GLenum;
  readonly TEXTURE15: GLenum;
  readonly TEXTURE16: GLenum;
  readonly TEXTURE17: GLenum;
  readonly TEXTURE18: GLenum;
  readonly TEXTURE19: GLenum;
  readonly TEXTURE2: GLenum;
  readonly TEXTURE20: GLenum;
  readonly TEXTURE21: GLenum;
  readonly TEXTURE22: GLenum;
  readonly TEXTURE23: GLenum;
  readonly TEXTURE24: GLenum;
  readonly TEXTURE25: GLenum;
  readonly TEXTURE26: GLenum;
  readonly TEXTURE27: GLenum;
  readonly TEXTURE28: GLenum;
  readonly TEXTURE29: GLenum;
  readonly TEXTURE3: GLenum;
  readonly TEXTURE30: GLenum;
  readonly TEXTURE31: GLenum;
  readonly TEXTURE4: GLenum;
  readonly TEXTURE5: GLenum;
  readonly TEXTURE6: GLenum;
  readonly TEXTURE7: GLenum;
  readonly TEXTURE8: GLenum;
  readonly TEXTURE9: GLenum;
  readonly TEXTURE_2D: GLenum;
  readonly TEXTURE_BINDING_2D: GLenum;
  readonly TEXTURE_BINDING_CUBE_MAP: GLenum;
  readonly TEXTURE_CUBE_MAP: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_X: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_Y: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_Z: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_X: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_Y: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_Z: GLenum;
  readonly TEXTURE_MAG_FILTER: GLenum;
  readonly TEXTURE_MIN_FILTER: GLenum;
  readonly TEXTURE_WRAP_S: GLenum;
  readonly TEXTURE_WRAP_T: GLenum;
  readonly TRIANGLES: GLenum;
  readonly TRIANGLE_FAN: GLenum;
  readonly TRIANGLE_STRIP: GLenum;
  readonly UNPACK_ALIGNMENT: GLenum;
  readonly UNPACK_COLORSPACE_CONVERSION_WEBGL: GLenum;
  readonly UNPACK_FLIP_Y_WEBGL: GLenum;
  readonly UNPACK_PREMULTIPLY_ALPHA_WEBGL: GLenum;
  readonly UNSIGNED_BYTE: GLenum;
  readonly UNSIGNED_INT: GLenum;
  readonly UNSIGNED_SHORT: GLenum;
  readonly UNSIGNED_SHORT_4_4_4_4: GLenum;
  readonly UNSIGNED_SHORT_5_5_5_1: GLenum;
  readonly UNSIGNED_SHORT_5_6_5: GLenum;
  readonly VALIDATE_STATUS: GLenum;
  readonly VENDOR: GLenum;
  readonly VERSION: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_ENABLED: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_NORMALIZED: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_POINTER: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_SIZE: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_STRIDE: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_TYPE: GLenum;
  readonly VERTEX_SHADER: GLenum;
  readonly VIEWPORT: GLenum;
  readonly ZERO: GLenum;
};

interface WebGL2RenderingContextBase {
  beginQuery(target: GLenum, query: WebGLQuery): void;
  beginTransformFeedback(primitiveMode: GLenum): void;
  bindBufferBase(
    target: GLenum,
    index: GLuint,
    buffer: WebGLBuffer | null
  ): void;
  bindBufferRange(
    target: GLenum,
    index: GLuint,
    buffer: WebGLBuffer | null,
    offset: GLintptr,
    size: GLsizeiptr
  ): void;
  bindSampler(unit: GLuint, sampler: WebGLSampler | null): void;
  bindTransformFeedback(
    target: GLenum,
    tf: WebGLTransformFeedback | null
  ): void;
  bindVertexArray(array: WebGLVertexArrayObject | null): void;
  blitFramebuffer(
    srcX0: GLint,
    srcY0: GLint,
    srcX1: GLint,
    srcY1: GLint,
    dstX0: GLint,
    dstY0: GLint,
    dstX1: GLint,
    dstY1: GLint,
    mask: GLbitfield,
    filter: GLenum
  ): void;
  clearBufferfi(
    buffer: GLenum,
    drawbuffer: GLint,
    depth: GLfloat,
    stencil: GLint
  ): void;
  clearBufferfv(
    buffer: GLenum,
    drawbuffer: GLint,
    values: Float32List,
    srcOffset?: GLuint
  ): void;
  clearBufferiv(
    buffer: GLenum,
    drawbuffer: GLint,
    values: Int32List,
    srcOffset?: GLuint
  ): void;
  clearBufferuiv(
    buffer: GLenum,
    drawbuffer: GLint,
    values: Uint32List,
    srcOffset?: GLuint
  ): void;
  clientWaitSync(sync: WebGLSync, flags: GLbitfield, timeout: GLuint64): GLenum;
  compressedTexImage3D(
    target: GLenum,
    level: GLint,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    border: GLint,
    imageSize: GLsizei,
    offset: GLintptr
  ): void;
  compressedTexImage3D(
    target: GLenum,
    level: GLint,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    border: GLint,
    srcData: ArrayBufferView,
    srcOffset?: GLuint,
    srcLengthOverride?: GLuint
  ): void;
  compressedTexSubImage3D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    zoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    format: GLenum,
    imageSize: GLsizei,
    offset: GLintptr
  ): void;
  compressedTexSubImage3D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    zoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    format: GLenum,
    srcData: ArrayBufferView,
    srcOffset?: GLuint,
    srcLengthOverride?: GLuint
  ): void;
  copyBufferSubData(
    readTarget: GLenum,
    writeTarget: GLenum,
    readOffset: GLintptr,
    writeOffset: GLintptr,
    size: GLsizeiptr
  ): void;
  copyTexSubImage3D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    zoffset: GLint,
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei
  ): void;
  createQuery(): WebGLQuery | null;
  createSampler(): WebGLSampler | null;
  createTransformFeedback(): WebGLTransformFeedback | null;
  createVertexArray(): WebGLVertexArrayObject | null;
  deleteQuery(query: WebGLQuery | null): void;
  deleteSampler(sampler: WebGLSampler | null): void;
  deleteSync(sync: WebGLSync | null): void;
  deleteTransformFeedback(tf: WebGLTransformFeedback | null): void;
  deleteVertexArray(vertexArray: WebGLVertexArrayObject | null): void;
  drawArraysInstanced(
    mode: GLenum,
    first: GLint,
    count: GLsizei,
    instanceCount: GLsizei
  ): void;
  drawBuffers(buffers: readonly GLenum[]): void;
  drawElementsInstanced(
    mode: GLenum,
    count: GLsizei,
    type: GLenum,
    offset: GLintptr,
    instanceCount: GLsizei
  ): void;
  drawRangeElements(
    mode: GLenum,
    start: GLuint,
    end: GLuint,
    count: GLsizei,
    type: GLenum,
    offset: GLintptr
  ): void;
  endQuery(target: GLenum): void;
  endTransformFeedback(): void;
  fenceSync(condition: GLenum, flags: GLbitfield): WebGLSync | null;
  framebufferTextureLayer(
    target: GLenum,
    attachment: GLenum,
    texture: WebGLTexture | null,
    level: GLint,
    layer: GLint
  ): void;
  getActiveUniformBlockName(
    program: WebGLProgram,
    uniformBlockIndex: GLuint
  ): string | null;
  getActiveUniformBlockParameter(
    program: WebGLProgram,
    uniformBlockIndex: GLuint,
    pname: GLenum
  ): unknown;
  getActiveUniforms(
    program: WebGLProgram,
    uniformIndices: readonly GLuint[],
    pname: GLenum
  ): unknown;
  getBufferSubData(
    target: GLenum,
    srcByteOffset: GLintptr,
    dstBuffer: ArrayBufferView,
    dstOffset?: GLuint,
    length?: GLuint
  ): void;
  getFragDataLocation(program: WebGLProgram, name: string): GLint;
  getIndexedParameter(target: GLenum, index: GLuint): unknown;
  getInternalformatParameter(
    target: GLenum,
    internalformat: GLenum,
    pname: GLenum
  ): unknown;
  getQuery(target: GLenum, pname: GLenum): WebGLQuery | null;
  getQueryParameter(query: WebGLQuery, pname: GLenum): unknown;
  getSamplerParameter(sampler: WebGLSampler, pname: GLenum): unknown;
  getSyncParameter(sync: WebGLSync, pname: GLenum): unknown;
  getTransformFeedbackVarying(
    program: WebGLProgram,
    index: GLuint
  ): WebGLActiveInfo | null;
  getUniformBlockIndex(program: WebGLProgram, uniformBlockName: string): GLuint;
  getUniformIndices(
    program: WebGLProgram,
    uniformNames: readonly string[]
  ): readonly GLuint[] | null;
  invalidateFramebuffer(target: GLenum, attachments: readonly GLenum[]): void;
  invalidateSubFramebuffer(
    target: GLenum,
    attachments: readonly GLenum[],
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei
  ): void;
  isQuery(query: WebGLQuery | null): GLboolean;
  isSampler(sampler: WebGLSampler | null): GLboolean;
  isSync(sync: WebGLSync | null): GLboolean;
  isTransformFeedback(tf: WebGLTransformFeedback | null): GLboolean;
  isVertexArray(vertexArray: WebGLVertexArrayObject | null): GLboolean;
  pauseTransformFeedback(): void;
  readBuffer(src: GLenum): void;
  renderbufferStorageMultisample(
    target: GLenum,
    samples: GLsizei,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei
  ): void;
  resumeTransformFeedback(): void;
  samplerParameterf(sampler: WebGLSampler, pname: GLenum, param: GLfloat): void;
  samplerParameteri(sampler: WebGLSampler, pname: GLenum, param: GLint): void;
  texImage3D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    pboOffset: GLintptr
  ): void;
  texImage3D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    source: TexImageSource
  ): void;
  texImage3D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    srcData: ArrayBufferView | null
  ): void;
  texImage3D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    srcData: ArrayBufferView,
    srcOffset: GLuint
  ): void;
  texStorage2D(
    target: GLenum,
    levels: GLsizei,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei
  ): void;
  texStorage3D(
    target: GLenum,
    levels: GLsizei,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei
  ): void;
  texSubImage3D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    zoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    format: GLenum,
    type: GLenum,
    pboOffset: GLintptr
  ): void;
  texSubImage3D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    zoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    format: GLenum,
    type: GLenum,
    source: TexImageSource
  ): void;
  texSubImage3D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    zoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    format: GLenum,
    type: GLenum,
    srcData: ArrayBufferView | null,
    srcOffset?: GLuint
  ): void;
  transformFeedbackVaryings(
    program: WebGLProgram,
    varyings: readonly string[],
    bufferMode: GLenum
  ): void;
  uniform1ui(location: WebGLUniformLocation | null, v0: GLuint): void;
  uniform1uiv(
    location: WebGLUniformLocation | null,
    data: Uint32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform2ui(
    location: WebGLUniformLocation | null,
    v0: GLuint,
    v1: GLuint
  ): void;
  uniform2uiv(
    location: WebGLUniformLocation | null,
    data: Uint32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform3ui(
    location: WebGLUniformLocation | null,
    v0: GLuint,
    v1: GLuint,
    v2: GLuint
  ): void;
  uniform3uiv(
    location: WebGLUniformLocation | null,
    data: Uint32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform4ui(
    location: WebGLUniformLocation | null,
    v0: GLuint,
    v1: GLuint,
    v2: GLuint,
    v3: GLuint
  ): void;
  uniform4uiv(
    location: WebGLUniformLocation | null,
    data: Uint32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformBlockBinding(
    program: WebGLProgram,
    uniformBlockIndex: GLuint,
    uniformBlockBinding: GLuint
  ): void;
  uniformMatrix2x3fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformMatrix2x4fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformMatrix3x2fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformMatrix3x4fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformMatrix4x2fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformMatrix4x3fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  vertexAttribDivisor(index: GLuint, divisor: GLuint): void;
  vertexAttribI4i(index: GLuint, x: GLint, y: GLint, z: GLint, w: GLint): void;
  vertexAttribI4iv(index: GLuint, values: Int32List): void;
  vertexAttribI4ui(
    index: GLuint,
    x: GLuint,
    y: GLuint,
    z: GLuint,
    w: GLuint
  ): void;
  vertexAttribI4uiv(index: GLuint, values: Uint32List): void;
  vertexAttribIPointer(
    index: GLuint,
    size: GLint,
    type: GLenum,
    stride: GLsizei,
    offset: GLintptr
  ): void;
  waitSync(sync: WebGLSync, flags: GLbitfield, timeout: GLint64): void;
  readonly ACTIVE_UNIFORM_BLOCKS: GLenum;
  readonly ALREADY_SIGNALED: GLenum;
  readonly ANY_SAMPLES_PASSED: GLenum;
  readonly ANY_SAMPLES_PASSED_CONSERVATIVE: GLenum;
  readonly COLOR: GLenum;
  readonly COLOR_ATTACHMENT1: GLenum;
  readonly COLOR_ATTACHMENT10: GLenum;
  readonly COLOR_ATTACHMENT11: GLenum;
  readonly COLOR_ATTACHMENT12: GLenum;
  readonly COLOR_ATTACHMENT13: GLenum;
  readonly COLOR_ATTACHMENT14: GLenum;
  readonly COLOR_ATTACHMENT15: GLenum;
  readonly COLOR_ATTACHMENT2: GLenum;
  readonly COLOR_ATTACHMENT3: GLenum;
  readonly COLOR_ATTACHMENT4: GLenum;
  readonly COLOR_ATTACHMENT5: GLenum;
  readonly COLOR_ATTACHMENT6: GLenum;
  readonly COLOR_ATTACHMENT7: GLenum;
  readonly COLOR_ATTACHMENT8: GLenum;
  readonly COLOR_ATTACHMENT9: GLenum;
  readonly COMPARE_REF_TO_TEXTURE: GLenum;
  readonly CONDITION_SATISFIED: GLenum;
  readonly COPY_READ_BUFFER: GLenum;
  readonly COPY_READ_BUFFER_BINDING: GLenum;
  readonly COPY_WRITE_BUFFER: GLenum;
  readonly COPY_WRITE_BUFFER_BINDING: GLenum;
  readonly CURRENT_QUERY: GLenum;
  readonly DEPTH: GLenum;
  readonly DEPTH24_STENCIL8: GLenum;
  readonly DEPTH32F_STENCIL8: GLenum;
  readonly DEPTH_COMPONENT24: GLenum;
  readonly DEPTH_COMPONENT32F: GLenum;
  readonly DRAW_BUFFER0: GLenum;
  readonly DRAW_BUFFER1: GLenum;
  readonly DRAW_BUFFER10: GLenum;
  readonly DRAW_BUFFER11: GLenum;
  readonly DRAW_BUFFER12: GLenum;
  readonly DRAW_BUFFER13: GLenum;
  readonly DRAW_BUFFER14: GLenum;
  readonly DRAW_BUFFER15: GLenum;
  readonly DRAW_BUFFER2: GLenum;
  readonly DRAW_BUFFER3: GLenum;
  readonly DRAW_BUFFER4: GLenum;
  readonly DRAW_BUFFER5: GLenum;
  readonly DRAW_BUFFER6: GLenum;
  readonly DRAW_BUFFER7: GLenum;
  readonly DRAW_BUFFER8: GLenum;
  readonly DRAW_BUFFER9: GLenum;
  readonly DRAW_FRAMEBUFFER: GLenum;
  readonly DRAW_FRAMEBUFFER_BINDING: GLenum;
  readonly DYNAMIC_COPY: GLenum;
  readonly DYNAMIC_READ: GLenum;
  readonly FLOAT_32_UNSIGNED_INT_24_8_REV: GLenum;
  readonly FLOAT_MAT2x3: GLenum;
  readonly FLOAT_MAT2x4: GLenum;
  readonly FLOAT_MAT3x2: GLenum;
  readonly FLOAT_MAT3x4: GLenum;
  readonly FLOAT_MAT4x2: GLenum;
  readonly FLOAT_MAT4x3: GLenum;
  readonly FRAGMENT_SHADER_DERIVATIVE_HINT: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: GLenum;
  readonly FRAMEBUFFER_DEFAULT: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: GLenum;
  readonly HALF_FLOAT: GLenum;
  readonly INTERLEAVED_ATTRIBS: GLenum;
  readonly INT_2_10_10_10_REV: GLenum;
  readonly INT_SAMPLER_2D: GLenum;
  readonly INT_SAMPLER_2D_ARRAY: GLenum;
  readonly INT_SAMPLER_3D: GLenum;
  readonly INT_SAMPLER_CUBE: GLenum;
  readonly INVALID_INDEX: GLenum;
  readonly MAX: GLenum;
  readonly MAX_3D_TEXTURE_SIZE: GLenum;
  readonly MAX_ARRAY_TEXTURE_LAYERS: GLenum;
  readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: GLenum;
  readonly MAX_COLOR_ATTACHMENTS: GLenum;
  readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: GLenum;
  readonly MAX_COMBINED_UNIFORM_BLOCKS: GLenum;
  readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: GLenum;
  readonly MAX_DRAW_BUFFERS: GLenum;
  readonly MAX_ELEMENTS_INDICES: GLenum;
  readonly MAX_ELEMENTS_VERTICES: GLenum;
  readonly MAX_ELEMENT_INDEX: GLenum;
  readonly MAX_FRAGMENT_INPUT_COMPONENTS: GLenum;
  readonly MAX_FRAGMENT_UNIFORM_BLOCKS: GLenum;
  readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: GLenum;
  readonly MAX_PROGRAM_TEXEL_OFFSET: GLenum;
  readonly MAX_SAMPLES: GLenum;
  readonly MAX_SERVER_WAIT_TIMEOUT: GLenum;
  readonly MAX_TEXTURE_LOD_BIAS: GLenum;
  readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: GLenum;
  readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: GLenum;
  readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: GLenum;
  readonly MAX_UNIFORM_BLOCK_SIZE: GLenum;
  readonly MAX_UNIFORM_BUFFER_BINDINGS: GLenum;
  readonly MAX_VARYING_COMPONENTS: GLenum;
  readonly MAX_VERTEX_OUTPUT_COMPONENTS: GLenum;
  readonly MAX_VERTEX_UNIFORM_BLOCKS: GLenum;
  readonly MAX_VERTEX_UNIFORM_COMPONENTS: GLenum;
  readonly MIN: GLenum;
  readonly MIN_PROGRAM_TEXEL_OFFSET: GLenum;
  readonly OBJECT_TYPE: GLenum;
  readonly PACK_ROW_LENGTH: GLenum;
  readonly PACK_SKIP_PIXELS: GLenum;
  readonly PACK_SKIP_ROWS: GLenum;
  readonly PIXEL_PACK_BUFFER: GLenum;
  readonly PIXEL_PACK_BUFFER_BINDING: GLenum;
  readonly PIXEL_UNPACK_BUFFER: GLenum;
  readonly PIXEL_UNPACK_BUFFER_BINDING: GLenum;
  readonly QUERY_RESULT: GLenum;
  readonly QUERY_RESULT_AVAILABLE: GLenum;
  readonly R11F_G11F_B10F: GLenum;
  readonly R16F: GLenum;
  readonly R16I: GLenum;
  readonly R16UI: GLenum;
  readonly R32F: GLenum;
  readonly R32I: GLenum;
  readonly R32UI: GLenum;
  readonly R8: GLenum;
  readonly R8I: GLenum;
  readonly R8UI: GLenum;
  readonly R8_SNORM: GLenum;
  readonly RASTERIZER_DISCARD: GLenum;
  readonly READ_BUFFER: GLenum;
  readonly READ_FRAMEBUFFER: GLenum;
  readonly READ_FRAMEBUFFER_BINDING: GLenum;
  readonly RED: GLenum;
  readonly RED_INTEGER: GLenum;
  readonly RENDERBUFFER_SAMPLES: GLenum;
  readonly RG: GLenum;
  readonly RG16F: GLenum;
  readonly RG16I: GLenum;
  readonly RG16UI: GLenum;
  readonly RG32F: GLenum;
  readonly RG32I: GLenum;
  readonly RG32UI: GLenum;
  readonly RG8: GLenum;
  readonly RG8I: GLenum;
  readonly RG8UI: GLenum;
  readonly RG8_SNORM: GLenum;
  readonly RGB10_A2: GLenum;
  readonly RGB10_A2UI: GLenum;
  readonly RGB16F: GLenum;
  readonly RGB16I: GLenum;
  readonly RGB16UI: GLenum;
  readonly RGB32F: GLenum;
  readonly RGB32I: GLenum;
  readonly RGB32UI: GLenum;
  readonly RGB8: GLenum;
  readonly RGB8I: GLenum;
  readonly RGB8UI: GLenum;
  readonly RGB8_SNORM: GLenum;
  readonly RGB9_E5: GLenum;
  readonly RGBA16F: GLenum;
  readonly RGBA16I: GLenum;
  readonly RGBA16UI: GLenum;
  readonly RGBA32F: GLenum;
  readonly RGBA32I: GLenum;
  readonly RGBA32UI: GLenum;
  readonly RGBA8: GLenum;
  readonly RGBA8I: GLenum;
  readonly RGBA8UI: GLenum;
  readonly RGBA8_SNORM: GLenum;
  readonly RGBA_INTEGER: GLenum;
  readonly RGB_INTEGER: GLenum;
  readonly RG_INTEGER: GLenum;
  readonly SAMPLER_2D_ARRAY: GLenum;
  readonly SAMPLER_2D_ARRAY_SHADOW: GLenum;
  readonly SAMPLER_2D_SHADOW: GLenum;
  readonly SAMPLER_3D: GLenum;
  readonly SAMPLER_BINDING: GLenum;
  readonly SAMPLER_CUBE_SHADOW: GLenum;
  readonly SEPARATE_ATTRIBS: GLenum;
  readonly SIGNALED: GLenum;
  readonly SIGNED_NORMALIZED: GLenum;
  readonly SRGB: GLenum;
  readonly SRGB8: GLenum;
  readonly SRGB8_ALPHA8: GLenum;
  readonly STATIC_COPY: GLenum;
  readonly STATIC_READ: GLenum;
  readonly STENCIL: GLenum;
  readonly STREAM_COPY: GLenum;
  readonly STREAM_READ: GLenum;
  readonly SYNC_CONDITION: GLenum;
  readonly SYNC_FENCE: GLenum;
  readonly SYNC_FLAGS: GLenum;
  readonly SYNC_FLUSH_COMMANDS_BIT: GLenum;
  readonly SYNC_GPU_COMMANDS_COMPLETE: GLenum;
  readonly SYNC_STATUS: GLenum;
  readonly TEXTURE_2D_ARRAY: GLenum;
  readonly TEXTURE_3D: GLenum;
  readonly TEXTURE_BASE_LEVEL: GLenum;
  readonly TEXTURE_BINDING_2D_ARRAY: GLenum;
  readonly TEXTURE_BINDING_3D: GLenum;
  readonly TEXTURE_COMPARE_FUNC: GLenum;
  readonly TEXTURE_COMPARE_MODE: GLenum;
  readonly TEXTURE_IMMUTABLE_FORMAT: GLenum;
  readonly TEXTURE_IMMUTABLE_LEVELS: GLenum;
  readonly TEXTURE_MAX_LEVEL: GLenum;
  readonly TEXTURE_MAX_LOD: GLenum;
  readonly TEXTURE_MIN_LOD: GLenum;
  readonly TEXTURE_WRAP_R: GLenum;
  readonly TIMEOUT_EXPIRED: GLenum;
  readonly TIMEOUT_IGNORED: GLint64;
  readonly TRANSFORM_FEEDBACK: GLenum;
  readonly TRANSFORM_FEEDBACK_ACTIVE: GLenum;
  readonly TRANSFORM_FEEDBACK_BINDING: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER_MODE: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: GLenum;
  readonly TRANSFORM_FEEDBACK_BUFFER_START: GLenum;
  readonly TRANSFORM_FEEDBACK_PAUSED: GLenum;
  readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: GLenum;
  readonly TRANSFORM_FEEDBACK_VARYINGS: GLenum;
  readonly UNIFORM_ARRAY_STRIDE: GLenum;
  readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: GLenum;
  readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: GLenum;
  readonly UNIFORM_BLOCK_BINDING: GLenum;
  readonly UNIFORM_BLOCK_DATA_SIZE: GLenum;
  readonly UNIFORM_BLOCK_INDEX: GLenum;
  readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: GLenum;
  readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: GLenum;
  readonly UNIFORM_BUFFER: GLenum;
  readonly UNIFORM_BUFFER_BINDING: GLenum;
  readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: GLenum;
  readonly UNIFORM_BUFFER_SIZE: GLenum;
  readonly UNIFORM_BUFFER_START: GLenum;
  readonly UNIFORM_IS_ROW_MAJOR: GLenum;
  readonly UNIFORM_MATRIX_STRIDE: GLenum;
  readonly UNIFORM_OFFSET: GLenum;
  readonly UNIFORM_SIZE: GLenum;
  readonly UNIFORM_TYPE: GLenum;
  readonly UNPACK_IMAGE_HEIGHT: GLenum;
  readonly UNPACK_ROW_LENGTH: GLenum;
  readonly UNPACK_SKIP_IMAGES: GLenum;
  readonly UNPACK_SKIP_PIXELS: GLenum;
  readonly UNPACK_SKIP_ROWS: GLenum;
  readonly UNSIGNALED: GLenum;
  readonly UNSIGNED_INT_10F_11F_11F_REV: GLenum;
  readonly UNSIGNED_INT_24_8: GLenum;
  readonly UNSIGNED_INT_2_10_10_10_REV: GLenum;
  readonly UNSIGNED_INT_5_9_9_9_REV: GLenum;
  readonly UNSIGNED_INT_SAMPLER_2D: GLenum;
  readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: GLenum;
  readonly UNSIGNED_INT_SAMPLER_3D: GLenum;
  readonly UNSIGNED_INT_SAMPLER_CUBE: GLenum;
  readonly UNSIGNED_INT_VEC2: GLenum;
  readonly UNSIGNED_INT_VEC3: GLenum;
  readonly UNSIGNED_INT_VEC4: GLenum;
  readonly UNSIGNED_NORMALIZED: GLenum;
  readonly VERTEX_ARRAY_BINDING: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_DIVISOR: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_INTEGER: GLenum;
  readonly WAIT_FAILED: GLenum;
}

interface WebGL2RenderingContextOverloads {
  bufferData(target: GLenum, size: GLsizeiptr, usage: GLenum): void;
  bufferData(target: GLenum, srcData: BufferSource | null, usage: GLenum): void;
  bufferData(
    target: GLenum,
    srcData: ArrayBufferView,
    usage: GLenum,
    srcOffset: GLuint,
    length?: GLuint
  ): void;
  bufferSubData(
    target: GLenum,
    dstByteOffset: GLintptr,
    srcData: BufferSource
  ): void;
  bufferSubData(
    target: GLenum,
    dstByteOffset: GLintptr,
    srcData: ArrayBufferView,
    srcOffset: GLuint,
    length?: GLuint
  ): void;
  compressedTexImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    imageSize: GLsizei,
    offset: GLintptr
  ): void;
  compressedTexImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    srcData: ArrayBufferView,
    srcOffset?: GLuint,
    srcLengthOverride?: GLuint
  ): void;
  compressedTexSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    imageSize: GLsizei,
    offset: GLintptr
  ): void;
  compressedTexSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    srcData: ArrayBufferView,
    srcOffset?: GLuint,
    srcLengthOverride?: GLuint
  ): void;
  readPixels(
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    dstData: ArrayBufferView | null
  ): void;
  readPixels(
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    offset: GLintptr
  ): void;
  readPixels(
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    dstData: ArrayBufferView,
    dstOffset: GLuint
  ): void;
  texImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    pixels: ArrayBufferView | null
  ): void;
  texImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    format: GLenum,
    type: GLenum,
    source: TexImageSource
  ): void;
  texImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    pboOffset: GLintptr
  ): void;
  texImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    source: TexImageSource
  ): void;
  texImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    srcData: ArrayBufferView,
    srcOffset: GLuint
  ): void;
  texSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    pixels: ArrayBufferView | null
  ): void;
  texSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    format: GLenum,
    type: GLenum,
    source: TexImageSource
  ): void;
  texSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    pboOffset: GLintptr
  ): void;
  texSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    source: TexImageSource
  ): void;
  texSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    srcData: ArrayBufferView,
    srcOffset: GLuint
  ): void;
  uniform1fv(
    location: WebGLUniformLocation | null,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform1iv(
    location: WebGLUniformLocation | null,
    data: Int32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform2fv(
    location: WebGLUniformLocation | null,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform2iv(
    location: WebGLUniformLocation | null,
    data: Int32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform3fv(
    location: WebGLUniformLocation | null,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform3iv(
    location: WebGLUniformLocation | null,
    data: Int32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform4fv(
    location: WebGLUniformLocation | null,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniform4iv(
    location: WebGLUniformLocation | null,
    data: Int32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformMatrix2fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformMatrix3fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
  uniformMatrix4fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    data: Float32List,
    srcOffset?: GLuint,
    srcLength?: GLuint
  ): void;
}

/** Part of the WebGL API and represents the information returned by calling the WebGLRenderingContext.getActiveAttrib() and WebGLRenderingContext.getActiveUniform() methods. */
interface WebGLActiveInfo {
  readonly name: string;
  readonly size: GLint;
  readonly type: GLenum;
}

declare const WebGLActiveInfo: {
  readonly prototype: WebGLActiveInfo;
  new (): WebGLActiveInfo;
};

/** Part of the WebGL API and represents an opaque buffer object storing data such as vertices or colors. */
interface WebGLBuffer {}

declare const WebGLBuffer: {
  readonly prototype: WebGLBuffer;
  new (): WebGLBuffer;
};

/** The WebContextEvent interface is part of the WebGL API and is an interface for an event that is generated in response to a status change to the WebGL rendering context. */
interface WebGLContextEvent extends Event {
  readonly statusMessage: string;
}

declare const WebGLContextEvent: {
  readonly prototype: WebGLContextEvent;
  new (type: string, eventInit?: WebGLContextEventInit): WebGLContextEvent;
};

/** Part of the WebGL API and represents a collection of buffers that serve as a rendering destination. */
interface WebGLFramebuffer {}

declare const WebGLFramebuffer: {
  readonly prototype: WebGLFramebuffer;
  new (): WebGLFramebuffer;
};

/** The WebGLProgram is part of the WebGL API and is a combination of two compiled WebGLShaders consisting of a vertex shader and a fragment shader (both written in GLSL). */
interface WebGLProgram {}

declare const WebGLProgram: {
  readonly prototype: WebGLProgram;
  new (): WebGLProgram;
};

interface WebGLQuery {}

declare const WebGLQuery: {
  readonly prototype: WebGLQuery;
  new (): WebGLQuery;
};

/** Part of the WebGL API and represents a buffer that can contain an image, or can be source or target of an rendering operation. */
interface WebGLRenderbuffer {}

declare const WebGLRenderbuffer: {
  readonly prototype: WebGLRenderbuffer;
  new (): WebGLRenderbuffer;
};

/** Provides an interface to the OpenGL ES 2.0 graphics rendering context for the drawing surface of an HTML <canvas> element. */
interface WebGLRenderingContext
  extends WebGLRenderingContextBase,
    WebGLRenderingContextOverloads {}

declare const WebGLRenderingContext: {
  readonly prototype: WebGLRenderingContext;
  new (): WebGLRenderingContext;
  readonly ACTIVE_ATTRIBUTES: GLenum;
  readonly ACTIVE_TEXTURE: GLenum;
  readonly ACTIVE_UNIFORMS: GLenum;
  readonly ALIASED_LINE_WIDTH_RANGE: GLenum;
  readonly ALIASED_POINT_SIZE_RANGE: GLenum;
  readonly ALPHA: GLenum;
  readonly ALPHA_BITS: GLenum;
  readonly ALWAYS: GLenum;
  readonly ARRAY_BUFFER: GLenum;
  readonly ARRAY_BUFFER_BINDING: GLenum;
  readonly ATTACHED_SHADERS: GLenum;
  readonly BACK: GLenum;
  readonly BLEND: GLenum;
  readonly BLEND_COLOR: GLenum;
  readonly BLEND_DST_ALPHA: GLenum;
  readonly BLEND_DST_RGB: GLenum;
  readonly BLEND_EQUATION: GLenum;
  readonly BLEND_EQUATION_ALPHA: GLenum;
  readonly BLEND_EQUATION_RGB: GLenum;
  readonly BLEND_SRC_ALPHA: GLenum;
  readonly BLEND_SRC_RGB: GLenum;
  readonly BLUE_BITS: GLenum;
  readonly BOOL: GLenum;
  readonly BOOL_VEC2: GLenum;
  readonly BOOL_VEC3: GLenum;
  readonly BOOL_VEC4: GLenum;
  readonly BROWSER_DEFAULT_WEBGL: GLenum;
  readonly BUFFER_SIZE: GLenum;
  readonly BUFFER_USAGE: GLenum;
  readonly BYTE: GLenum;
  readonly CCW: GLenum;
  readonly CLAMP_TO_EDGE: GLenum;
  readonly COLOR_ATTACHMENT0: GLenum;
  readonly COLOR_BUFFER_BIT: GLenum;
  readonly COLOR_CLEAR_VALUE: GLenum;
  readonly COLOR_WRITEMASK: GLenum;
  readonly COMPILE_STATUS: GLenum;
  readonly COMPRESSED_TEXTURE_FORMATS: GLenum;
  readonly CONSTANT_ALPHA: GLenum;
  readonly CONSTANT_COLOR: GLenum;
  readonly CONTEXT_LOST_WEBGL: GLenum;
  readonly CULL_FACE: GLenum;
  readonly CULL_FACE_MODE: GLenum;
  readonly CURRENT_PROGRAM: GLenum;
  readonly CURRENT_VERTEX_ATTRIB: GLenum;
  readonly CW: GLenum;
  readonly DECR: GLenum;
  readonly DECR_WRAP: GLenum;
  readonly DELETE_STATUS: GLenum;
  readonly DEPTH_ATTACHMENT: GLenum;
  readonly DEPTH_BITS: GLenum;
  readonly DEPTH_BUFFER_BIT: GLenum;
  readonly DEPTH_CLEAR_VALUE: GLenum;
  readonly DEPTH_COMPONENT: GLenum;
  readonly DEPTH_COMPONENT16: GLenum;
  readonly DEPTH_FUNC: GLenum;
  readonly DEPTH_RANGE: GLenum;
  readonly DEPTH_STENCIL: GLenum;
  readonly DEPTH_STENCIL_ATTACHMENT: GLenum;
  readonly DEPTH_TEST: GLenum;
  readonly DEPTH_WRITEMASK: GLenum;
  readonly DITHER: GLenum;
  readonly DONT_CARE: GLenum;
  readonly DST_ALPHA: GLenum;
  readonly DST_COLOR: GLenum;
  readonly DYNAMIC_DRAW: GLenum;
  readonly ELEMENT_ARRAY_BUFFER: GLenum;
  readonly ELEMENT_ARRAY_BUFFER_BINDING: GLenum;
  readonly EQUAL: GLenum;
  readonly FASTEST: GLenum;
  readonly FLOAT: GLenum;
  readonly FLOAT_MAT2: GLenum;
  readonly FLOAT_MAT3: GLenum;
  readonly FLOAT_MAT4: GLenum;
  readonly FLOAT_VEC2: GLenum;
  readonly FLOAT_VEC3: GLenum;
  readonly FLOAT_VEC4: GLenum;
  readonly FRAGMENT_SHADER: GLenum;
  readonly FRAMEBUFFER: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: GLenum;
  readonly FRAMEBUFFER_BINDING: GLenum;
  readonly FRAMEBUFFER_COMPLETE: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_ATTACHMENT: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_DIMENSIONS: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: GLenum;
  readonly FRAMEBUFFER_UNSUPPORTED: GLenum;
  readonly FRONT: GLenum;
  readonly FRONT_AND_BACK: GLenum;
  readonly FRONT_FACE: GLenum;
  readonly FUNC_ADD: GLenum;
  readonly FUNC_REVERSE_SUBTRACT: GLenum;
  readonly FUNC_SUBTRACT: GLenum;
  readonly GENERATE_MIPMAP_HINT: GLenum;
  readonly GEQUAL: GLenum;
  readonly GREATER: GLenum;
  readonly GREEN_BITS: GLenum;
  readonly HIGH_FLOAT: GLenum;
  readonly HIGH_INT: GLenum;
  readonly IMPLEMENTATION_COLOR_READ_FORMAT: GLenum;
  readonly IMPLEMENTATION_COLOR_READ_TYPE: GLenum;
  readonly INCR: GLenum;
  readonly INCR_WRAP: GLenum;
  readonly INT: GLenum;
  readonly INT_VEC2: GLenum;
  readonly INT_VEC3: GLenum;
  readonly INT_VEC4: GLenum;
  readonly INVALID_ENUM: GLenum;
  readonly INVALID_FRAMEBUFFER_OPERATION: GLenum;
  readonly INVALID_OPERATION: GLenum;
  readonly INVALID_VALUE: GLenum;
  readonly INVERT: GLenum;
  readonly KEEP: GLenum;
  readonly LEQUAL: GLenum;
  readonly LESS: GLenum;
  readonly LINEAR: GLenum;
  readonly LINEAR_MIPMAP_LINEAR: GLenum;
  readonly LINEAR_MIPMAP_NEAREST: GLenum;
  readonly LINES: GLenum;
  readonly LINE_LOOP: GLenum;
  readonly LINE_STRIP: GLenum;
  readonly LINE_WIDTH: GLenum;
  readonly LINK_STATUS: GLenum;
  readonly LOW_FLOAT: GLenum;
  readonly LOW_INT: GLenum;
  readonly LUMINANCE: GLenum;
  readonly LUMINANCE_ALPHA: GLenum;
  readonly MAX_COMBINED_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_CUBE_MAP_TEXTURE_SIZE: GLenum;
  readonly MAX_FRAGMENT_UNIFORM_VECTORS: GLenum;
  readonly MAX_RENDERBUFFER_SIZE: GLenum;
  readonly MAX_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_TEXTURE_SIZE: GLenum;
  readonly MAX_VARYING_VECTORS: GLenum;
  readonly MAX_VERTEX_ATTRIBS: GLenum;
  readonly MAX_VERTEX_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_VERTEX_UNIFORM_VECTORS: GLenum;
  readonly MAX_VIEWPORT_DIMS: GLenum;
  readonly MEDIUM_FLOAT: GLenum;
  readonly MEDIUM_INT: GLenum;
  readonly MIRRORED_REPEAT: GLenum;
  readonly NEAREST: GLenum;
  readonly NEAREST_MIPMAP_LINEAR: GLenum;
  readonly NEAREST_MIPMAP_NEAREST: GLenum;
  readonly NEVER: GLenum;
  readonly NICEST: GLenum;
  readonly NONE: GLenum;
  readonly NOTEQUAL: GLenum;
  readonly NO_ERROR: GLenum;
  readonly ONE: GLenum;
  readonly ONE_MINUS_CONSTANT_ALPHA: GLenum;
  readonly ONE_MINUS_CONSTANT_COLOR: GLenum;
  readonly ONE_MINUS_DST_ALPHA: GLenum;
  readonly ONE_MINUS_DST_COLOR: GLenum;
  readonly ONE_MINUS_SRC_ALPHA: GLenum;
  readonly ONE_MINUS_SRC_COLOR: GLenum;
  readonly OUT_OF_MEMORY: GLenum;
  readonly PACK_ALIGNMENT: GLenum;
  readonly POINTS: GLenum;
  readonly POLYGON_OFFSET_FACTOR: GLenum;
  readonly POLYGON_OFFSET_FILL: GLenum;
  readonly POLYGON_OFFSET_UNITS: GLenum;
  readonly RED_BITS: GLenum;
  readonly RENDERBUFFER: GLenum;
  readonly RENDERBUFFER_ALPHA_SIZE: GLenum;
  readonly RENDERBUFFER_BINDING: GLenum;
  readonly RENDERBUFFER_BLUE_SIZE: GLenum;
  readonly RENDERBUFFER_DEPTH_SIZE: GLenum;
  readonly RENDERBUFFER_GREEN_SIZE: GLenum;
  readonly RENDERBUFFER_HEIGHT: GLenum;
  readonly RENDERBUFFER_INTERNAL_FORMAT: GLenum;
  readonly RENDERBUFFER_RED_SIZE: GLenum;
  readonly RENDERBUFFER_STENCIL_SIZE: GLenum;
  readonly RENDERBUFFER_WIDTH: GLenum;
  readonly RENDERER: GLenum;
  readonly REPEAT: GLenum;
  readonly REPLACE: GLenum;
  readonly RGB: GLenum;
  readonly RGB565: GLenum;
  readonly RGB5_A1: GLenum;
  readonly RGBA: GLenum;
  readonly RGBA4: GLenum;
  readonly SAMPLER_2D: GLenum;
  readonly SAMPLER_CUBE: GLenum;
  readonly SAMPLES: GLenum;
  readonly SAMPLE_ALPHA_TO_COVERAGE: GLenum;
  readonly SAMPLE_BUFFERS: GLenum;
  readonly SAMPLE_COVERAGE: GLenum;
  readonly SAMPLE_COVERAGE_INVERT: GLenum;
  readonly SAMPLE_COVERAGE_VALUE: GLenum;
  readonly SCISSOR_BOX: GLenum;
  readonly SCISSOR_TEST: GLenum;
  readonly SHADER_TYPE: GLenum;
  readonly SHADING_LANGUAGE_VERSION: GLenum;
  readonly SHORT: GLenum;
  readonly SRC_ALPHA: GLenum;
  readonly SRC_ALPHA_SATURATE: GLenum;
  readonly SRC_COLOR: GLenum;
  readonly STATIC_DRAW: GLenum;
  readonly STENCIL_ATTACHMENT: GLenum;
  readonly STENCIL_BACK_FAIL: GLenum;
  readonly STENCIL_BACK_FUNC: GLenum;
  readonly STENCIL_BACK_PASS_DEPTH_FAIL: GLenum;
  readonly STENCIL_BACK_PASS_DEPTH_PASS: GLenum;
  readonly STENCIL_BACK_REF: GLenum;
  readonly STENCIL_BACK_VALUE_MASK: GLenum;
  readonly STENCIL_BACK_WRITEMASK: GLenum;
  readonly STENCIL_BITS: GLenum;
  readonly STENCIL_BUFFER_BIT: GLenum;
  readonly STENCIL_CLEAR_VALUE: GLenum;
  readonly STENCIL_FAIL: GLenum;
  readonly STENCIL_FUNC: GLenum;
  readonly STENCIL_INDEX8: GLenum;
  readonly STENCIL_PASS_DEPTH_FAIL: GLenum;
  readonly STENCIL_PASS_DEPTH_PASS: GLenum;
  readonly STENCIL_REF: GLenum;
  readonly STENCIL_TEST: GLenum;
  readonly STENCIL_VALUE_MASK: GLenum;
  readonly STENCIL_WRITEMASK: GLenum;
  readonly STREAM_DRAW: GLenum;
  readonly SUBPIXEL_BITS: GLenum;
  readonly TEXTURE: GLenum;
  readonly TEXTURE0: GLenum;
  readonly TEXTURE1: GLenum;
  readonly TEXTURE10: GLenum;
  readonly TEXTURE11: GLenum;
  readonly TEXTURE12: GLenum;
  readonly TEXTURE13: GLenum;
  readonly TEXTURE14: GLenum;
  readonly TEXTURE15: GLenum;
  readonly TEXTURE16: GLenum;
  readonly TEXTURE17: GLenum;
  readonly TEXTURE18: GLenum;
  readonly TEXTURE19: GLenum;
  readonly TEXTURE2: GLenum;
  readonly TEXTURE20: GLenum;
  readonly TEXTURE21: GLenum;
  readonly TEXTURE22: GLenum;
  readonly TEXTURE23: GLenum;
  readonly TEXTURE24: GLenum;
  readonly TEXTURE25: GLenum;
  readonly TEXTURE26: GLenum;
  readonly TEXTURE27: GLenum;
  readonly TEXTURE28: GLenum;
  readonly TEXTURE29: GLenum;
  readonly TEXTURE3: GLenum;
  readonly TEXTURE30: GLenum;
  readonly TEXTURE31: GLenum;
  readonly TEXTURE4: GLenum;
  readonly TEXTURE5: GLenum;
  readonly TEXTURE6: GLenum;
  readonly TEXTURE7: GLenum;
  readonly TEXTURE8: GLenum;
  readonly TEXTURE9: GLenum;
  readonly TEXTURE_2D: GLenum;
  readonly TEXTURE_BINDING_2D: GLenum;
  readonly TEXTURE_BINDING_CUBE_MAP: GLenum;
  readonly TEXTURE_CUBE_MAP: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_X: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_Y: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_Z: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_X: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_Y: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_Z: GLenum;
  readonly TEXTURE_MAG_FILTER: GLenum;
  readonly TEXTURE_MIN_FILTER: GLenum;
  readonly TEXTURE_WRAP_S: GLenum;
  readonly TEXTURE_WRAP_T: GLenum;
  readonly TRIANGLES: GLenum;
  readonly TRIANGLE_FAN: GLenum;
  readonly TRIANGLE_STRIP: GLenum;
  readonly UNPACK_ALIGNMENT: GLenum;
  readonly UNPACK_COLORSPACE_CONVERSION_WEBGL: GLenum;
  readonly UNPACK_FLIP_Y_WEBGL: GLenum;
  readonly UNPACK_PREMULTIPLY_ALPHA_WEBGL: GLenum;
  readonly UNSIGNED_BYTE: GLenum;
  readonly UNSIGNED_INT: GLenum;
  readonly UNSIGNED_SHORT: GLenum;
  readonly UNSIGNED_SHORT_4_4_4_4: GLenum;
  readonly UNSIGNED_SHORT_5_5_5_1: GLenum;
  readonly UNSIGNED_SHORT_5_6_5: GLenum;
  readonly VALIDATE_STATUS: GLenum;
  readonly VENDOR: GLenum;
  readonly VERSION: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_ENABLED: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_NORMALIZED: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_POINTER: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_SIZE: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_STRIDE: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_TYPE: GLenum;
  readonly VERTEX_SHADER: GLenum;
  readonly VIEWPORT: GLenum;
  readonly ZERO: GLenum;
};

interface WebGLRenderingContextBase {
  readonly canvas: HTMLCanvasElement;
  readonly drawingBufferHeight: GLsizei;
  readonly drawingBufferWidth: GLsizei;
  activeTexture(texture: GLenum): void;
  attachShader(program: WebGLProgram, shader: WebGLShader): void;
  bindAttribLocation(program: WebGLProgram, index: GLuint, name: string): void;
  bindBuffer(target: GLenum, buffer: WebGLBuffer | null): void;
  bindFramebuffer(target: GLenum, framebuffer: WebGLFramebuffer | null): void;
  bindRenderbuffer(
    target: GLenum,
    renderbuffer: WebGLRenderbuffer | null
  ): void;
  bindTexture(target: GLenum, texture: WebGLTexture | null): void;
  blendColor(
    red: GLclampf,
    green: GLclampf,
    blue: GLclampf,
    alpha: GLclampf
  ): void;
  blendEquation(mode: GLenum): void;
  blendEquationSeparate(modeRGB: GLenum, modeAlpha: GLenum): void;
  blendFunc(sfactor: GLenum, dfactor: GLenum): void;
  blendFuncSeparate(
    srcRGB: GLenum,
    dstRGB: GLenum,
    srcAlpha: GLenum,
    dstAlpha: GLenum
  ): void;
  checkFramebufferStatus(target: GLenum): GLenum;
  clear(mask: GLbitfield): void;
  clearColor(
    red: GLclampf,
    green: GLclampf,
    blue: GLclampf,
    alpha: GLclampf
  ): void;
  clearDepth(depth: GLclampf): void;
  clearStencil(s: GLint): void;
  colorMask(
    red: GLboolean,
    green: GLboolean,
    blue: GLboolean,
    alpha: GLboolean
  ): void;
  compileShader(shader: WebGLShader): void;
  copyTexImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLenum,
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei,
    border: GLint
  ): void;
  copyTexSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei
  ): void;
  createBuffer(): WebGLBuffer | null;
  createFramebuffer(): WebGLFramebuffer | null;
  createProgram(): WebGLProgram | null;
  createRenderbuffer(): WebGLRenderbuffer | null;
  createShader(type: GLenum): WebGLShader | null;
  createTexture(): WebGLTexture | null;
  cullFace(mode: GLenum): void;
  deleteBuffer(buffer: WebGLBuffer | null): void;
  deleteFramebuffer(framebuffer: WebGLFramebuffer | null): void;
  deleteProgram(program: WebGLProgram | null): void;
  deleteRenderbuffer(renderbuffer: WebGLRenderbuffer | null): void;
  deleteShader(shader: WebGLShader | null): void;
  deleteTexture(texture: WebGLTexture | null): void;
  depthFunc(func: GLenum): void;
  depthMask(flag: GLboolean): void;
  depthRange(zNear: GLclampf, zFar: GLclampf): void;
  detachShader(program: WebGLProgram, shader: WebGLShader): void;
  disable(cap: GLenum): void;
  disableVertexAttribArray(index: GLuint): void;
  drawArrays(mode: GLenum, first: GLint, count: GLsizei): void;
  drawElements(
    mode: GLenum,
    count: GLsizei,
    type: GLenum,
    offset: GLintptr
  ): void;
  enable(cap: GLenum): void;
  enableVertexAttribArray(index: GLuint): void;
  finish(): void;
  flush(): void;
  framebufferRenderbuffer(
    target: GLenum,
    attachment: GLenum,
    renderbuffertarget: GLenum,
    renderbuffer: WebGLRenderbuffer | null
  ): void;
  framebufferTexture2D(
    target: GLenum,
    attachment: GLenum,
    textarget: GLenum,
    texture: WebGLTexture | null,
    level: GLint
  ): void;
  frontFace(mode: GLenum): void;
  generateMipmap(target: GLenum): void;
  getActiveAttrib(program: WebGLProgram, index: GLuint): WebGLActiveInfo | null;
  getActiveUniform(
    program: WebGLProgram,
    index: GLuint
  ): WebGLActiveInfo | null;
  getAttachedShaders(program: WebGLProgram): readonly WebGLShader[] | null;
  getAttribLocation(program: WebGLProgram, name: string): GLint;
  getBufferParameter(target: GLenum, pname: GLenum): unknown;
  getContextAttributes(): WebGLContextAttributes | null;
  getError(): GLenum;
  getExtension(extensionName: 'EXT_blend_minmax'): EXT_blend_minmax | null;
  getExtension(
    extensionName: 'EXT_color_buffer_float'
  ): EXT_color_buffer_float | null;
  getExtension(
    extensionName: 'EXT_color_buffer_half_float'
  ): EXT_color_buffer_half_float | null;
  getExtension(extensionName: 'EXT_float_blend'): EXT_float_blend | null;
  getExtension(
    extensionName: 'EXT_texture_filter_anisotropic'
  ): EXT_texture_filter_anisotropic | null;
  getExtension(extensionName: 'EXT_frag_depth'): EXT_frag_depth | null;
  getExtension(
    extensionName: 'EXT_shader_texture_lod'
  ): EXT_shader_texture_lod | null;
  getExtension(extensionName: 'EXT_sRGB'): EXT_sRGB | null;
  getExtension(
    extensionName: 'KHR_parallel_shader_compile'
  ): KHR_parallel_shader_compile | null;
  getExtension(
    extensionName: 'OES_vertex_array_object'
  ): OES_vertex_array_object | null;
  getExtension(extensionName: 'OVR_multiview2'): OVR_multiview2 | null;
  getExtension(
    extensionName: 'WEBGL_color_buffer_float'
  ): WEBGL_color_buffer_float | null;
  getExtension(
    extensionName: 'WEBGL_compressed_texture_astc'
  ): WEBGL_compressed_texture_astc | null;
  getExtension(
    extensionName: 'WEBGL_compressed_texture_etc'
  ): WEBGL_compressed_texture_etc | null;
  getExtension(
    extensionName: 'WEBGL_compressed_texture_etc1'
  ): WEBGL_compressed_texture_etc1 | null;
  getExtension(
    extensionName: 'WEBGL_compressed_texture_s3tc_srgb'
  ): WEBGL_compressed_texture_s3tc_srgb | null;
  getExtension(
    extensionName: 'WEBGL_debug_shaders'
  ): WEBGL_debug_shaders | null;
  getExtension(extensionName: 'WEBGL_draw_buffers'): WEBGL_draw_buffers | null;
  getExtension(extensionName: 'WEBGL_lose_context'): WEBGL_lose_context | null;
  getExtension(
    extensionName: 'WEBGL_depth_texture'
  ): WEBGL_depth_texture | null;
  getExtension(
    extensionName: 'WEBGL_debug_renderer_info'
  ): WEBGL_debug_renderer_info | null;
  getExtension(
    extensionName: 'WEBGL_compressed_texture_s3tc'
  ): WEBGL_compressed_texture_s3tc | null;
  getExtension(
    extensionName: 'OES_texture_half_float_linear'
  ): OES_texture_half_float_linear | null;
  getExtension(
    extensionName: 'OES_texture_half_float'
  ): OES_texture_half_float | null;
  getExtension(
    extensionName: 'OES_texture_float_linear'
  ): OES_texture_float_linear | null;
  getExtension(extensionName: 'OES_texture_float'): OES_texture_float | null;
  getExtension(
    extensionName: 'OES_standard_derivatives'
  ): OES_standard_derivatives | null;
  getExtension(
    extensionName: 'OES_element_index_uint'
  ): OES_element_index_uint | null;
  getExtension(
    extensionName: 'ANGLE_instanced_arrays'
  ): ANGLE_instanced_arrays | null;
  getExtension(name: string): unknown;
  getFramebufferAttachmentParameter(
    target: GLenum,
    attachment: GLenum,
    pname: GLenum
  ): unknown;
  getParameter(pname: GLenum): unknown;
  getProgramInfoLog(program: WebGLProgram): string | null;
  getProgramParameter(program: WebGLProgram, pname: GLenum): unknown;
  getRenderbufferParameter(target: GLenum, pname: GLenum): unknown;
  getShaderInfoLog(shader: WebGLShader): string | null;
  getShaderParameter(shader: WebGLShader, pname: GLenum): unknown;
  getShaderPrecisionFormat(
    shadertype: GLenum,
    precisiontype: GLenum
  ): WebGLShaderPrecisionFormat | null;
  getShaderSource(shader: WebGLShader): string | null;
  getSupportedExtensions(): readonly string[] | null;
  getTexParameter(target: GLenum, pname: GLenum): unknown;
  getUniform(program: WebGLProgram, location: WebGLUniformLocation): unknown;
  getUniformLocation(
    program: WebGLProgram,
    name: string
  ): WebGLUniformLocation | null;
  getVertexAttrib(index: GLuint, pname: GLenum): unknown;
  getVertexAttribOffset(index: GLuint, pname: GLenum): GLintptr;
  hint(target: GLenum, mode: GLenum): void;
  isBuffer(buffer: WebGLBuffer | null): GLboolean;
  isContextLost(): boolean;
  isEnabled(cap: GLenum): GLboolean;
  isFramebuffer(framebuffer: WebGLFramebuffer | null): GLboolean;
  isProgram(program: WebGLProgram | null): GLboolean;
  isRenderbuffer(renderbuffer: WebGLRenderbuffer | null): GLboolean;
  isShader(shader: WebGLShader | null): GLboolean;
  isTexture(texture: WebGLTexture | null): GLboolean;
  lineWidth(width: GLfloat): void;
  linkProgram(program: WebGLProgram): void;
  pixelStorei(pname: GLenum, param: GLint | GLboolean): void;
  polygonOffset(factor: GLfloat, units: GLfloat): void;
  renderbufferStorage(
    target: GLenum,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei
  ): void;
  sampleCoverage(value: GLclampf, invert: GLboolean): void;
  scissor(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void;
  shaderSource(shader: WebGLShader, source: string): void;
  stencilFunc(func: GLenum, ref: GLint, mask: GLuint): void;
  stencilFuncSeparate(
    face: GLenum,
    func: GLenum,
    ref: GLint,
    mask: GLuint
  ): void;
  stencilMask(mask: GLuint): void;
  stencilMaskSeparate(face: GLenum, mask: GLuint): void;
  stencilOp(fail: GLenum, zfail: GLenum, zpass: GLenum): void;
  stencilOpSeparate(
    face: GLenum,
    fail: GLenum,
    zfail: GLenum,
    zpass: GLenum
  ): void;
  texParameterf(target: GLenum, pname: GLenum, param: GLfloat): void;
  texParameteri(target: GLenum, pname: GLenum, param: GLint): void;
  uniform1f(location: WebGLUniformLocation | null, x: GLfloat): void;
  uniform1i(location: WebGLUniformLocation | null, x: GLint): void;
  uniform2f(
    location: WebGLUniformLocation | null,
    x: GLfloat,
    y: GLfloat
  ): void;
  uniform2i(location: WebGLUniformLocation | null, x: GLint, y: GLint): void;
  uniform3f(
    location: WebGLUniformLocation | null,
    x: GLfloat,
    y: GLfloat,
    z: GLfloat
  ): void;
  uniform3i(
    location: WebGLUniformLocation | null,
    x: GLint,
    y: GLint,
    z: GLint
  ): void;
  uniform4f(
    location: WebGLUniformLocation | null,
    x: GLfloat,
    y: GLfloat,
    z: GLfloat,
    w: GLfloat
  ): void;
  uniform4i(
    location: WebGLUniformLocation | null,
    x: GLint,
    y: GLint,
    z: GLint,
    w: GLint
  ): void;
  useProgram(program: WebGLProgram | null): void;
  validateProgram(program: WebGLProgram): void;
  vertexAttrib1f(index: GLuint, x: GLfloat): void;
  vertexAttrib1fv(index: GLuint, values: Float32List): void;
  vertexAttrib2f(index: GLuint, x: GLfloat, y: GLfloat): void;
  vertexAttrib2fv(index: GLuint, values: Float32List): void;
  vertexAttrib3f(index: GLuint, x: GLfloat, y: GLfloat, z: GLfloat): void;
  vertexAttrib3fv(index: GLuint, values: Float32List): void;
  vertexAttrib4f(
    index: GLuint,
    x: GLfloat,
    y: GLfloat,
    z: GLfloat,
    w: GLfloat
  ): void;
  vertexAttrib4fv(index: GLuint, values: Float32List): void;
  vertexAttribPointer(
    index: GLuint,
    size: GLint,
    type: GLenum,
    normalized: GLboolean,
    stride: GLsizei,
    offset: GLintptr
  ): void;
  viewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void;
  readonly ACTIVE_ATTRIBUTES: GLenum;
  readonly ACTIVE_TEXTURE: GLenum;
  readonly ACTIVE_UNIFORMS: GLenum;
  readonly ALIASED_LINE_WIDTH_RANGE: GLenum;
  readonly ALIASED_POINT_SIZE_RANGE: GLenum;
  readonly ALPHA: GLenum;
  readonly ALPHA_BITS: GLenum;
  readonly ALWAYS: GLenum;
  readonly ARRAY_BUFFER: GLenum;
  readonly ARRAY_BUFFER_BINDING: GLenum;
  readonly ATTACHED_SHADERS: GLenum;
  readonly BACK: GLenum;
  readonly BLEND: GLenum;
  readonly BLEND_COLOR: GLenum;
  readonly BLEND_DST_ALPHA: GLenum;
  readonly BLEND_DST_RGB: GLenum;
  readonly BLEND_EQUATION: GLenum;
  readonly BLEND_EQUATION_ALPHA: GLenum;
  readonly BLEND_EQUATION_RGB: GLenum;
  readonly BLEND_SRC_ALPHA: GLenum;
  readonly BLEND_SRC_RGB: GLenum;
  readonly BLUE_BITS: GLenum;
  readonly BOOL: GLenum;
  readonly BOOL_VEC2: GLenum;
  readonly BOOL_VEC3: GLenum;
  readonly BOOL_VEC4: GLenum;
  readonly BROWSER_DEFAULT_WEBGL: GLenum;
  readonly BUFFER_SIZE: GLenum;
  readonly BUFFER_USAGE: GLenum;
  readonly BYTE: GLenum;
  readonly CCW: GLenum;
  readonly CLAMP_TO_EDGE: GLenum;
  readonly COLOR_ATTACHMENT0: GLenum;
  readonly COLOR_BUFFER_BIT: GLenum;
  readonly COLOR_CLEAR_VALUE: GLenum;
  readonly COLOR_WRITEMASK: GLenum;
  readonly COMPILE_STATUS: GLenum;
  readonly COMPRESSED_TEXTURE_FORMATS: GLenum;
  readonly CONSTANT_ALPHA: GLenum;
  readonly CONSTANT_COLOR: GLenum;
  readonly CONTEXT_LOST_WEBGL: GLenum;
  readonly CULL_FACE: GLenum;
  readonly CULL_FACE_MODE: GLenum;
  readonly CURRENT_PROGRAM: GLenum;
  readonly CURRENT_VERTEX_ATTRIB: GLenum;
  readonly CW: GLenum;
  readonly DECR: GLenum;
  readonly DECR_WRAP: GLenum;
  readonly DELETE_STATUS: GLenum;
  readonly DEPTH_ATTACHMENT: GLenum;
  readonly DEPTH_BITS: GLenum;
  readonly DEPTH_BUFFER_BIT: GLenum;
  readonly DEPTH_CLEAR_VALUE: GLenum;
  readonly DEPTH_COMPONENT: GLenum;
  readonly DEPTH_COMPONENT16: GLenum;
  readonly DEPTH_FUNC: GLenum;
  readonly DEPTH_RANGE: GLenum;
  readonly DEPTH_STENCIL: GLenum;
  readonly DEPTH_STENCIL_ATTACHMENT: GLenum;
  readonly DEPTH_TEST: GLenum;
  readonly DEPTH_WRITEMASK: GLenum;
  readonly DITHER: GLenum;
  readonly DONT_CARE: GLenum;
  readonly DST_ALPHA: GLenum;
  readonly DST_COLOR: GLenum;
  readonly DYNAMIC_DRAW: GLenum;
  readonly ELEMENT_ARRAY_BUFFER: GLenum;
  readonly ELEMENT_ARRAY_BUFFER_BINDING: GLenum;
  readonly EQUAL: GLenum;
  readonly FASTEST: GLenum;
  readonly FLOAT: GLenum;
  readonly FLOAT_MAT2: GLenum;
  readonly FLOAT_MAT3: GLenum;
  readonly FLOAT_MAT4: GLenum;
  readonly FLOAT_VEC2: GLenum;
  readonly FLOAT_VEC3: GLenum;
  readonly FLOAT_VEC4: GLenum;
  readonly FRAGMENT_SHADER: GLenum;
  readonly FRAMEBUFFER: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: GLenum;
  readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: GLenum;
  readonly FRAMEBUFFER_BINDING: GLenum;
  readonly FRAMEBUFFER_COMPLETE: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_ATTACHMENT: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_DIMENSIONS: GLenum;
  readonly FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: GLenum;
  readonly FRAMEBUFFER_UNSUPPORTED: GLenum;
  readonly FRONT: GLenum;
  readonly FRONT_AND_BACK: GLenum;
  readonly FRONT_FACE: GLenum;
  readonly FUNC_ADD: GLenum;
  readonly FUNC_REVERSE_SUBTRACT: GLenum;
  readonly FUNC_SUBTRACT: GLenum;
  readonly GENERATE_MIPMAP_HINT: GLenum;
  readonly GEQUAL: GLenum;
  readonly GREATER: GLenum;
  readonly GREEN_BITS: GLenum;
  readonly HIGH_FLOAT: GLenum;
  readonly HIGH_INT: GLenum;
  readonly IMPLEMENTATION_COLOR_READ_FORMAT: GLenum;
  readonly IMPLEMENTATION_COLOR_READ_TYPE: GLenum;
  readonly INCR: GLenum;
  readonly INCR_WRAP: GLenum;
  readonly INT: GLenum;
  readonly INT_VEC2: GLenum;
  readonly INT_VEC3: GLenum;
  readonly INT_VEC4: GLenum;
  readonly INVALID_ENUM: GLenum;
  readonly INVALID_FRAMEBUFFER_OPERATION: GLenum;
  readonly INVALID_OPERATION: GLenum;
  readonly INVALID_VALUE: GLenum;
  readonly INVERT: GLenum;
  readonly KEEP: GLenum;
  readonly LEQUAL: GLenum;
  readonly LESS: GLenum;
  readonly LINEAR: GLenum;
  readonly LINEAR_MIPMAP_LINEAR: GLenum;
  readonly LINEAR_MIPMAP_NEAREST: GLenum;
  readonly LINES: GLenum;
  readonly LINE_LOOP: GLenum;
  readonly LINE_STRIP: GLenum;
  readonly LINE_WIDTH: GLenum;
  readonly LINK_STATUS: GLenum;
  readonly LOW_FLOAT: GLenum;
  readonly LOW_INT: GLenum;
  readonly LUMINANCE: GLenum;
  readonly LUMINANCE_ALPHA: GLenum;
  readonly MAX_COMBINED_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_CUBE_MAP_TEXTURE_SIZE: GLenum;
  readonly MAX_FRAGMENT_UNIFORM_VECTORS: GLenum;
  readonly MAX_RENDERBUFFER_SIZE: GLenum;
  readonly MAX_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_TEXTURE_SIZE: GLenum;
  readonly MAX_VARYING_VECTORS: GLenum;
  readonly MAX_VERTEX_ATTRIBS: GLenum;
  readonly MAX_VERTEX_TEXTURE_IMAGE_UNITS: GLenum;
  readonly MAX_VERTEX_UNIFORM_VECTORS: GLenum;
  readonly MAX_VIEWPORT_DIMS: GLenum;
  readonly MEDIUM_FLOAT: GLenum;
  readonly MEDIUM_INT: GLenum;
  readonly MIRRORED_REPEAT: GLenum;
  readonly NEAREST: GLenum;
  readonly NEAREST_MIPMAP_LINEAR: GLenum;
  readonly NEAREST_MIPMAP_NEAREST: GLenum;
  readonly NEVER: GLenum;
  readonly NICEST: GLenum;
  readonly NONE: GLenum;
  readonly NOTEQUAL: GLenum;
  readonly NO_ERROR: GLenum;
  readonly ONE: GLenum;
  readonly ONE_MINUS_CONSTANT_ALPHA: GLenum;
  readonly ONE_MINUS_CONSTANT_COLOR: GLenum;
  readonly ONE_MINUS_DST_ALPHA: GLenum;
  readonly ONE_MINUS_DST_COLOR: GLenum;
  readonly ONE_MINUS_SRC_ALPHA: GLenum;
  readonly ONE_MINUS_SRC_COLOR: GLenum;
  readonly OUT_OF_MEMORY: GLenum;
  readonly PACK_ALIGNMENT: GLenum;
  readonly POINTS: GLenum;
  readonly POLYGON_OFFSET_FACTOR: GLenum;
  readonly POLYGON_OFFSET_FILL: GLenum;
  readonly POLYGON_OFFSET_UNITS: GLenum;
  readonly RED_BITS: GLenum;
  readonly RENDERBUFFER: GLenum;
  readonly RENDERBUFFER_ALPHA_SIZE: GLenum;
  readonly RENDERBUFFER_BINDING: GLenum;
  readonly RENDERBUFFER_BLUE_SIZE: GLenum;
  readonly RENDERBUFFER_DEPTH_SIZE: GLenum;
  readonly RENDERBUFFER_GREEN_SIZE: GLenum;
  readonly RENDERBUFFER_HEIGHT: GLenum;
  readonly RENDERBUFFER_INTERNAL_FORMAT: GLenum;
  readonly RENDERBUFFER_RED_SIZE: GLenum;
  readonly RENDERBUFFER_STENCIL_SIZE: GLenum;
  readonly RENDERBUFFER_WIDTH: GLenum;
  readonly RENDERER: GLenum;
  readonly REPEAT: GLenum;
  readonly REPLACE: GLenum;
  readonly RGB: GLenum;
  readonly RGB565: GLenum;
  readonly RGB5_A1: GLenum;
  readonly RGBA: GLenum;
  readonly RGBA4: GLenum;
  readonly SAMPLER_2D: GLenum;
  readonly SAMPLER_CUBE: GLenum;
  readonly SAMPLES: GLenum;
  readonly SAMPLE_ALPHA_TO_COVERAGE: GLenum;
  readonly SAMPLE_BUFFERS: GLenum;
  readonly SAMPLE_COVERAGE: GLenum;
  readonly SAMPLE_COVERAGE_INVERT: GLenum;
  readonly SAMPLE_COVERAGE_VALUE: GLenum;
  readonly SCISSOR_BOX: GLenum;
  readonly SCISSOR_TEST: GLenum;
  readonly SHADER_TYPE: GLenum;
  readonly SHADING_LANGUAGE_VERSION: GLenum;
  readonly SHORT: GLenum;
  readonly SRC_ALPHA: GLenum;
  readonly SRC_ALPHA_SATURATE: GLenum;
  readonly SRC_COLOR: GLenum;
  readonly STATIC_DRAW: GLenum;
  readonly STENCIL_ATTACHMENT: GLenum;
  readonly STENCIL_BACK_FAIL: GLenum;
  readonly STENCIL_BACK_FUNC: GLenum;
  readonly STENCIL_BACK_PASS_DEPTH_FAIL: GLenum;
  readonly STENCIL_BACK_PASS_DEPTH_PASS: GLenum;
  readonly STENCIL_BACK_REF: GLenum;
  readonly STENCIL_BACK_VALUE_MASK: GLenum;
  readonly STENCIL_BACK_WRITEMASK: GLenum;
  readonly STENCIL_BITS: GLenum;
  readonly STENCIL_BUFFER_BIT: GLenum;
  readonly STENCIL_CLEAR_VALUE: GLenum;
  readonly STENCIL_FAIL: GLenum;
  readonly STENCIL_FUNC: GLenum;
  readonly STENCIL_INDEX8: GLenum;
  readonly STENCIL_PASS_DEPTH_FAIL: GLenum;
  readonly STENCIL_PASS_DEPTH_PASS: GLenum;
  readonly STENCIL_REF: GLenum;
  readonly STENCIL_TEST: GLenum;
  readonly STENCIL_VALUE_MASK: GLenum;
  readonly STENCIL_WRITEMASK: GLenum;
  readonly STREAM_DRAW: GLenum;
  readonly SUBPIXEL_BITS: GLenum;
  readonly TEXTURE: GLenum;
  readonly TEXTURE0: GLenum;
  readonly TEXTURE1: GLenum;
  readonly TEXTURE10: GLenum;
  readonly TEXTURE11: GLenum;
  readonly TEXTURE12: GLenum;
  readonly TEXTURE13: GLenum;
  readonly TEXTURE14: GLenum;
  readonly TEXTURE15: GLenum;
  readonly TEXTURE16: GLenum;
  readonly TEXTURE17: GLenum;
  readonly TEXTURE18: GLenum;
  readonly TEXTURE19: GLenum;
  readonly TEXTURE2: GLenum;
  readonly TEXTURE20: GLenum;
  readonly TEXTURE21: GLenum;
  readonly TEXTURE22: GLenum;
  readonly TEXTURE23: GLenum;
  readonly TEXTURE24: GLenum;
  readonly TEXTURE25: GLenum;
  readonly TEXTURE26: GLenum;
  readonly TEXTURE27: GLenum;
  readonly TEXTURE28: GLenum;
  readonly TEXTURE29: GLenum;
  readonly TEXTURE3: GLenum;
  readonly TEXTURE30: GLenum;
  readonly TEXTURE31: GLenum;
  readonly TEXTURE4: GLenum;
  readonly TEXTURE5: GLenum;
  readonly TEXTURE6: GLenum;
  readonly TEXTURE7: GLenum;
  readonly TEXTURE8: GLenum;
  readonly TEXTURE9: GLenum;
  readonly TEXTURE_2D: GLenum;
  readonly TEXTURE_BINDING_2D: GLenum;
  readonly TEXTURE_BINDING_CUBE_MAP: GLenum;
  readonly TEXTURE_CUBE_MAP: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_X: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_Y: GLenum;
  readonly TEXTURE_CUBE_MAP_NEGATIVE_Z: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_X: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_Y: GLenum;
  readonly TEXTURE_CUBE_MAP_POSITIVE_Z: GLenum;
  readonly TEXTURE_MAG_FILTER: GLenum;
  readonly TEXTURE_MIN_FILTER: GLenum;
  readonly TEXTURE_WRAP_S: GLenum;
  readonly TEXTURE_WRAP_T: GLenum;
  readonly TRIANGLES: GLenum;
  readonly TRIANGLE_FAN: GLenum;
  readonly TRIANGLE_STRIP: GLenum;
  readonly UNPACK_ALIGNMENT: GLenum;
  readonly UNPACK_COLORSPACE_CONVERSION_WEBGL: GLenum;
  readonly UNPACK_FLIP_Y_WEBGL: GLenum;
  readonly UNPACK_PREMULTIPLY_ALPHA_WEBGL: GLenum;
  readonly UNSIGNED_BYTE: GLenum;
  readonly UNSIGNED_INT: GLenum;
  readonly UNSIGNED_SHORT: GLenum;
  readonly UNSIGNED_SHORT_4_4_4_4: GLenum;
  readonly UNSIGNED_SHORT_5_5_5_1: GLenum;
  readonly UNSIGNED_SHORT_5_6_5: GLenum;
  readonly VALIDATE_STATUS: GLenum;
  readonly VENDOR: GLenum;
  readonly VERSION: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_ENABLED: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_NORMALIZED: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_POINTER: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_SIZE: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_STRIDE: GLenum;
  readonly VERTEX_ATTRIB_ARRAY_TYPE: GLenum;
  readonly VERTEX_SHADER: GLenum;
  readonly VIEWPORT: GLenum;
  readonly ZERO: GLenum;
}

interface WebGLRenderingContextOverloads {
  bufferData(target: GLenum, size: GLsizeiptr, usage: GLenum): void;
  bufferData(target: GLenum, data: BufferSource | null, usage: GLenum): void;
  bufferSubData(target: GLenum, offset: GLintptr, data: BufferSource): void;
  compressedTexImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    data: ArrayBufferView
  ): void;
  compressedTexSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    data: ArrayBufferView
  ): void;
  readPixels(
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    pixels: ArrayBufferView | null
  ): void;
  texImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    format: GLenum,
    type: GLenum,
    pixels: ArrayBufferView | null
  ): void;
  texImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    format: GLenum,
    type: GLenum,
    source: TexImageSource
  ): void;
  texSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    type: GLenum,
    pixels: ArrayBufferView | null
  ): void;
  texSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    format: GLenum,
    type: GLenum,
    source: TexImageSource
  ): void;
  uniform1fv(location: WebGLUniformLocation | null, v: Float32List): void;
  uniform1iv(location: WebGLUniformLocation | null, v: Int32List): void;
  uniform2fv(location: WebGLUniformLocation | null, v: Float32List): void;
  uniform2iv(location: WebGLUniformLocation | null, v: Int32List): void;
  uniform3fv(location: WebGLUniformLocation | null, v: Float32List): void;
  uniform3iv(location: WebGLUniformLocation | null, v: Int32List): void;
  uniform4fv(location: WebGLUniformLocation | null, v: Float32List): void;
  uniform4iv(location: WebGLUniformLocation | null, v: Int32List): void;
  uniformMatrix2fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    value: Float32List
  ): void;
  uniformMatrix3fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    value: Float32List
  ): void;
  uniformMatrix4fv(
    location: WebGLUniformLocation | null,
    transpose: GLboolean,
    value: Float32List
  ): void;
}

interface WebGLSampler {}

declare const WebGLSampler: {
  readonly prototype: WebGLSampler;
  new (): WebGLSampler;
};

/** The WebGLShader is part of the WebGL API and can either be a vertex or a fragment shader. A WebGLProgram requires both types of shaders. */
interface WebGLShader {}

declare const WebGLShader: {
  readonly prototype: WebGLShader;
  new (): WebGLShader;
};

/** Part of the WebGL API and represents the information returned by calling the WebGLRenderingContext.getShaderPrecisionFormat() method. */
interface WebGLShaderPrecisionFormat {
  readonly precision: GLint;
  readonly rangeMax: GLint;
  readonly rangeMin: GLint;
}

declare const WebGLShaderPrecisionFormat: {
  readonly prototype: WebGLShaderPrecisionFormat;
  new (): WebGLShaderPrecisionFormat;
};

interface WebGLSync {}

declare const WebGLSync: {
  readonly prototype: WebGLSync;
  new (): WebGLSync;
};

/** Part of the WebGL API and represents an opaque texture object providing storage and state for texturing operations. */
interface WebGLTexture {}

declare const WebGLTexture: {
  readonly prototype: WebGLTexture;
  new (): WebGLTexture;
};

interface WebGLTransformFeedback {}

declare const WebGLTransformFeedback: {
  readonly prototype: WebGLTransformFeedback;
  new (): WebGLTransformFeedback;
};

/** Part of the WebGL API and represents the location of a uniform variable in a shader program. */
interface WebGLUniformLocation {}

declare const WebGLUniformLocation: {
  readonly prototype: WebGLUniformLocation;
  new (): WebGLUniformLocation;
};

interface WebGLVertexArrayObject {}

declare const WebGLVertexArrayObject: {
  readonly prototype: WebGLVertexArrayObject;
  new (): WebGLVertexArrayObject;
};

interface WebGLVertexArrayObjectOES {}

interface WebSocketEventMap {
  readonly close: CloseEvent;
  readonly error: Event;
  readonly message: MessageEvent;
  readonly open: Event;
}

/** Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection. */
interface WebSocket extends EventTarget {
  /**
   * Returns a string that indicates how binary data from the WebSocket object is exposed to scripts:
   *
   * Can be set, to change how binary data is returned. The default is "blob".
   */
  readonly binaryType: BinaryType;
  /**
   * Returns the number of bytes of application data (UTF-8 text and binary data) that have been queued using send() but not yet been transmitted to the network.
   *
   * If the WebSocket connection is closed, this attribute's value will only increase with each call to the send() method. (The number does not reset to zero once the connection closes.)
   */
  readonly bufferedAmount: number;
  /** Returns the extensions selected by the server, if any. */
  readonly extensions: string;
  readonly onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null;
  readonly onerror: ((this: WebSocket, ev: Event) => unknown) | null;
  readonly onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null;
  readonly onopen: ((this: WebSocket, ev: Event) => unknown) | null;
  /** Returns the subprotocol selected by the server, if any. It can be used in conjunction with the array form of the constructor's second argument to perform subprotocol negotiation. */
  readonly protocol: string;
  /** Returns the state of the WebSocket object's connection. It can have the values described below. */
  readonly readyState: number;
  /** Returns the URL that was used to establish the WebSocket connection. */
  readonly url: string;
  /** Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. */
  close(code?: number, reason?: string): void;
  /** Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
  readonly CLOSED: number;
  readonly CLOSING: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
  addEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const WebSocket: {
  readonly prototype: WebSocket;
  new (url: string | URL, protocols?: string | readonly string[]): WebSocket;
  readonly CLOSED: number;
  readonly CLOSING: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
};

/** Events that occur due to the user moving a mouse wheel or similar input device. */
interface WheelEvent extends MouseEvent {
  readonly deltaMode: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly deltaZ: number;
  readonly DOM_DELTA_LINE: number;
  readonly DOM_DELTA_PAGE: number;
  readonly DOM_DELTA_PIXEL: number;
}

declare const WheelEvent: {
  readonly prototype: WheelEvent;
  new (type: string, eventInitDict?: WheelEventInit): WheelEvent;
  readonly DOM_DELTA_LINE: number;
  readonly DOM_DELTA_PAGE: number;
  readonly DOM_DELTA_PIXEL: number;
};

interface WindowEventMap
  extends GlobalEventHandlersEventMap,
    WindowEventHandlersEventMap {
  readonly DOMContentLoaded: Event;
  readonly devicemotion: DeviceMotionEvent;
  readonly deviceorientation: DeviceOrientationEvent;
  readonly gamepadconnected: GamepadEvent;
  readonly gamepaddisconnected: GamepadEvent;
  readonly orientationchange: Event;
}

/** A window containing a DOM document; the document property points to the DOM document loaded in that window. */
interface Window
  extends EventTarget,
    AnimationFrameProvider,
    GlobalEventHandlers,
    WindowEventHandlers,
    WindowLocalStorage,
    WindowOrWorkerGlobalScope,
    WindowSessionStorage {
  /** @deprecated This is a legacy alias of `navigator`. */
  readonly clientInformation: Navigator;
  /** Returns true if the window has been closed, false otherwise. */
  readonly closed: boolean;
  /** Defines a new custom element, mapping the given name to the given constructor as an autonomous custom element. */
  readonly customElements: CustomElementRegistry;
  readonly devicePixelRatio: number;
  readonly document: Document;
  /** @deprecated */
  readonly event: Event | undefined;
  /** @deprecated */
  readonly external: External;
  readonly frameElement: Element | null;
  readonly frames: WindowProxy;
  readonly history: History;
  readonly innerHeight: number;
  readonly innerWidth: number;
  readonly length: number;
  get location(): Location;
  set location(href: string | Location);
  /** Returns true if the location bar is visible; otherwise, returns false. */
  readonly locationbar: BarProp;
  /** Returns true if the menu bar is visible; otherwise, returns false. */
  readonly menubar: BarProp;
  readonly name: string;
  readonly navigator: Navigator;
  /** Available only in secure contexts. */
  readonly ondevicemotion:
    | ((this: Window, ev: DeviceMotionEvent) => unknown)
    | null;
  /** Available only in secure contexts. */
  readonly ondeviceorientation:
    | ((this: Window, ev: DeviceOrientationEvent) => unknown)
    | null;
  /** @deprecated */
  readonly onorientationchange: ((this: Window, ev: Event) => unknown) | null;
  readonly opener: unknown;
  /** @deprecated */
  readonly orientation: number;
  readonly outerHeight: number;
  readonly outerWidth: number;
  /** @deprecated This is a legacy alias of `scrollX`. */
  readonly pageXOffset: number;
  /** @deprecated This is a legacy alias of `scrollY`. */
  readonly pageYOffset: number;
  /**
   * Refers to either the parent WindowProxy, or itself.
   *
   * It can rarely be null e.g. for contentWindow of an iframe that is already removed from the parent.
   */
  readonly parent: WindowProxy;
  /** Returns true if the personal bar is visible; otherwise, returns false. */
  readonly personalbar: BarProp;
  readonly screen: Screen;
  readonly screenLeft: number;
  readonly screenTop: number;
  readonly screenX: number;
  readonly screenY: number;
  readonly scrollX: number;
  readonly scrollY: number;
  /** Returns true if the scrollbars are visible; otherwise, returns false. */
  readonly scrollbars: BarProp;
  readonly self: Window & typeof globalThis;
  readonly speechSynthesis: SpeechSynthesis;
  /** @deprecated */
  readonly status: string;
  /** Returns true if the status bar is visible; otherwise, returns false. */
  readonly statusbar: BarProp;
  /** Returns true if the toolbar is visible; otherwise, returns false. */
  readonly toolbar: BarProp;
  readonly top: WindowProxy | null;
  readonly visualViewport: VisualViewport;
  readonly window: Window & typeof globalThis;
  alert(message?: unknown): void;
  blur(): void;
  cancelIdleCallback(handle: number): void;
  /** @deprecated */
  captureEvents(): void;
  /** Closes the window. */
  close(): void;
  confirm(message?: string): boolean;
  /** Moves the focus to the window's browsing context, if any. */
  focus(): void;
  getComputedStyle(
    elt: Element,
    pseudoElt?: string | null
  ): CSSStyleDeclaration;
  getSelection(): Selection | null;
  matchMedia(query: string): MediaQueryList;
  moveBy(x: number, y: number): void;
  moveTo(x: number, y: number): void;
  open(
    url?: string | URL,
    target?: string,
    features?: string
  ): WindowProxy | null;
  /**
   * Posts a message to the given window. Messages can be structured objects, e.g. nested objects and arrays, can contain JavaScript values (strings, numbers, Date objects, etc), and can contain certain data objects such as File Blob, FileList, and ArrayBuffer objects.
   *
   * Objects listed in the transfer member of options are transferred, not just cloned, meaning that they are no longer usable on the sending side.
   *
   * A target origin can be specified using the targetOrigin member of options. If not provided, it defaults to "/". This default restricts the message to same-origin targets only.
   *
   * If the origin of the target window doesn't match the given target origin, the message is discarded, to avoid information leakage. To send the message to the target regardless of origin, set the target origin to "*".
   *
   * Throws a "DataCloneError" DOMException if transfer array contains duplicate objects or if message could not be cloned.
   */
  postMessage(
    message: unknown,
    targetOrigin: string,
    transfer?: readonly Transferable[]
  ): void;
  postMessage(message: unknown, options?: WindowPostMessageOptions): void;
  print(): void;
  prompt(message?: string, _default?: string): string | null;
  /** @deprecated */
  releaseEvents(): void;
  requestIdleCallback(
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ): number;
  resizeBy(x: number, y: number): void;
  resizeTo(width: number, height: number): void;
  scroll(options?: ScrollToOptions): void;
  scroll(x: number, y: number): void;
  scrollBy(options?: ScrollToOptions): void;
  scrollBy(x: number, y: number): void;
  scrollTo(options?: ScrollToOptions): void;
  scrollTo(x: number, y: number): void;
  /** Cancels the document load. */
  stop(): void;
  addEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  readonly [index: number]: Window;
}

declare const Window: {
  readonly prototype: Window;
  new (): Window;
};

interface WindowEventHandlersEventMap {
  readonly afterprint: Event;
  readonly beforeprint: Event;
  readonly beforeunload: BeforeUnloadEvent;
  readonly gamepadconnected: GamepadEvent;
  readonly gamepaddisconnected: GamepadEvent;
  readonly hashchange: HashChangeEvent;
  readonly languagechange: Event;
  readonly message: MessageEvent;
  readonly messageerror: MessageEvent;
  readonly offline: Event;
  readonly online: Event;
  readonly pagehide: PageTransitionEvent;
  readonly pageshow: PageTransitionEvent;
  readonly popstate: PopStateEvent;
  readonly rejectionhandled: PromiseRejectionEvent;
  readonly storage: StorageEvent;
  readonly unhandledrejection: PromiseRejectionEvent;
  readonly unload: Event;
}

interface WindowEventHandlers {
  readonly onafterprint:
    | ((this: WindowEventHandlers, ev: Event) => unknown)
    | null;
  readonly onbeforeprint:
    | ((this: WindowEventHandlers, ev: Event) => unknown)
    | null;
  readonly onbeforeunload:
    | ((this: WindowEventHandlers, ev: BeforeUnloadEvent) => unknown)
    | null;
  readonly ongamepadconnected:
    | ((this: WindowEventHandlers, ev: GamepadEvent) => unknown)
    | null;
  readonly ongamepaddisconnected:
    | ((this: WindowEventHandlers, ev: GamepadEvent) => unknown)
    | null;
  readonly onhashchange:
    | ((this: WindowEventHandlers, ev: HashChangeEvent) => unknown)
    | null;
  readonly onlanguagechange:
    | ((this: WindowEventHandlers, ev: Event) => unknown)
    | null;
  readonly onmessage:
    | ((this: WindowEventHandlers, ev: MessageEvent) => unknown)
    | null;
  readonly onmessageerror:
    | ((this: WindowEventHandlers, ev: MessageEvent) => unknown)
    | null;
  readonly onoffline:
    | ((this: WindowEventHandlers, ev: Event) => unknown)
    | null;
  readonly ononline: ((this: WindowEventHandlers, ev: Event) => unknown) | null;
  readonly onpagehide:
    | ((this: WindowEventHandlers, ev: PageTransitionEvent) => unknown)
    | null;
  readonly onpageshow:
    | ((this: WindowEventHandlers, ev: PageTransitionEvent) => unknown)
    | null;
  readonly onpopstate:
    | ((this: WindowEventHandlers, ev: PopStateEvent) => unknown)
    | null;
  readonly onrejectionhandled:
    | ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => unknown)
    | null;
  readonly onstorage:
    | ((this: WindowEventHandlers, ev: StorageEvent) => unknown)
    | null;
  readonly onunhandledrejection:
    | ((this: WindowEventHandlers, ev: PromiseRejectionEvent) => unknown)
    | null;
  readonly onunload: ((this: WindowEventHandlers, ev: Event) => unknown) | null;
  addEventListener<K extends keyof WindowEventHandlersEventMap>(
    type: K,
    listener: (
      this: WindowEventHandlers,
      ev: WindowEventHandlersEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof WindowEventHandlersEventMap>(
    type: K,
    listener: (
      this: WindowEventHandlers,
      ev: WindowEventHandlersEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface WindowLocalStorage {
  readonly localStorage: Storage;
}

interface WindowOrWorkerGlobalScope {
  /** Available only in secure contexts. */
  readonly caches: CacheStorage;
  readonly crossOriginIsolated: boolean;
  readonly crypto: Crypto;
  readonly indexedDB: IDBFactory;
  readonly isSecureContext: boolean;
  readonly origin: string;
  readonly performance: Performance;
  atob(data: string): string;
  btoa(data: string): string;
  clearInterval(id?: number): void;
  clearTimeout(id?: number): void;
  createImageBitmap(
    image: ImageBitmapSource,
    options?: ImageBitmapOptions
  ): Promise<ImageBitmap>;
  createImageBitmap(
    image: ImageBitmapSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    options?: ImageBitmapOptions
  ): Promise<ImageBitmap>;
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  queueMicrotask(callback: VoidFunction): void;
  reportError(e: unknown): void;
  setInterval(
    handler: TimerHandler,
    timeout?: number,
    ...arguments: readonly unknown[]
  ): number;
  setTimeout(
    handler: TimerHandler,
    timeout?: number,
    ...arguments: readonly unknown[]
  ): number;
  structuredClone(
    value: unknown,
    options?: StructuredSerializeOptions
  ): unknown;
}

interface WindowSessionStorage {
  readonly sessionStorage: Storage;
}

interface WorkerEventMap extends AbstractWorkerEventMap {
  readonly message: MessageEvent;
  readonly messageerror: MessageEvent;
}

/** This Web Workers API interface represents a background task that can be easily created and can send messages back to its creator. Creating a worker is as simple as calling the Worker() constructor and specifying a script to be run in the worker thread. */
interface Worker extends EventTarget, AbstractWorker {
  readonly onmessage: ((this: Worker, ev: MessageEvent) => unknown) | null;
  readonly onmessageerror: ((this: Worker, ev: MessageEvent) => unknown) | null;
  /** Clones message and transmits it to worker's global environment. transfer can be passed as a list of objects that are to be transferred rather than cloned. */
  postMessage(message: unknown, transfer: readonly Transferable[]): void;
  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
  /** Aborts worker's associated global environment. */
  terminate(): void;
  addEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const Worker: {
  readonly prototype: Worker;
  new (scriptURL: string | URL, options?: WorkerOptions): Worker;
};

/** Available only in secure contexts. */
interface Worklet {
  /**
   * Loads and executes the module script given by moduleURL into all of worklet's global scopes. It can also create additional global scopes as part of this process, depending on the worklet type. The returned promise will fulfill once the script has been successfully loaded and run in all global scopes.
   *
   * The credentials option can be set to a credentials mode to modify the script-fetching process. It defaults to "same-origin".
   *
   * Any failures in fetching the script or its dependencies will cause the returned promise to be rejected with an "AbortError" DOMException. Any errors in parsing the script or its dependencies will cause the returned promise to be rejected with the exception generated during parsing.
   */
  addModule(moduleURL: string | URL, options?: WorkletOptions): Promise<void>;
}

declare const Worklet: {
  readonly prototype: Worklet;
  new (): Worklet;
};

/** This Streams API interface provides a standard abstraction for writing streaming data to a destination, known as a sink. This object comes with built-in backpressure and queuing. */
interface WritableStream<W = unknown> {
  readonly locked: boolean;
  abort(reason?: unknown): Promise<void>;
  close(): Promise<void>;
  getWriter(): WritableStreamDefaultWriter<W>;
}

declare const WritableStream: {
  readonly prototype: WritableStream;
  new <W = unknown>(
    underlyingSink?: UnderlyingSink<W>,
    strategy?: QueuingStrategy<W>
  ): WritableStream<W>;
};

/** This Streams API interface represents a controller allowing control of a WritableStream's state. When constructing a WritableStream, the underlying sink is given a corresponding WritableStreamDefaultController instance to manipulate. */
interface WritableStreamDefaultController {
  error(e?: unknown): void;
}

declare const WritableStreamDefaultController: {
  readonly prototype: WritableStreamDefaultController;
  new (): WritableStreamDefaultController;
};

/** This Streams API interface is the object returned by WritableStream.getWriter() and once created locks the < writer to the WritableStream ensuring that no other streams can write to the underlying sink. */
interface WritableStreamDefaultWriter<W = unknown> {
  readonly closed: Promise<undefined>;
  readonly desiredSize: number | null;
  readonly ready: Promise<undefined>;
  abort(reason?: unknown): Promise<void>;
  close(): Promise<void>;
  releaseLock(): void;
  write(chunk?: W): Promise<void>;
}

declare const WritableStreamDefaultWriter: {
  readonly prototype: WritableStreamDefaultWriter;
  new <W = unknown>(stream: WritableStream<W>): WritableStreamDefaultWriter<W>;
};

/** An XML document. It inherits from the generic Document and does not add any specific methods or properties to it: nevertheless, several algorithms behave differently with the two types of documents. */
interface XMLDocument extends Document {
  addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: XMLDocument, ev: DocumentEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: XMLDocument, ev: DocumentEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const XMLDocument: {
  readonly prototype: XMLDocument;
  new (): XMLDocument;
};

interface XMLHttpRequestEventMap extends XMLHttpRequestEventTargetEventMap {
  readonly readystatechange: Event;
}

/** Use XMLHttpRequest (XHR) objects to interact with servers. You can retrieve data from a URL without having to do a full page refresh. This enables a Web page to update just part of a page without disrupting what the user is doing. */
interface XMLHttpRequest extends XMLHttpRequestEventTarget {
  readonly onreadystatechange:
    | ((this: XMLHttpRequest, ev: Event) => unknown)
    | null;
  /** Returns client's state. */
  readonly readyState: number;
  /** Returns the response body. */
  readonly response: unknown;
  /**
   * Returns response as text.
   *
   * Throws an "InvalidStateError" DOMException if responseType is not the empty string or "text".
   */
  readonly responseText: string;
  /**
   * Returns the response type.
   *
   * Can be set to change the response type. Values are: the empty string (default), "arraybuffer", "blob", "document", "json", and "text".
   *
   * When set: setting to "document" is ignored if current global object is not a Window object.
   *
   * When set: throws an "InvalidStateError" DOMException if state is loading or done.
   *
   * When set: throws an "InvalidAccessError" DOMException if the synchronous flag is set and current global object is a Window object.
   */
  readonly responseType: XMLHttpRequestResponseType;
  readonly responseURL: string;
  /**
   * Returns the response as document.
   *
   * Throws an "InvalidStateError" DOMException if responseType is not the empty string or "document".
   */
  readonly responseXML: Document | null;
  readonly status: number;
  readonly statusText: string;
  /**
   * Can be set to a time in milliseconds. When set to a non-zero value will cause fetching to terminate after the given time has passed. When the time has passed, the request has not yet completed, and this's synchronous flag is unset, a timeout event will then be dispatched, or a "TimeoutError" DOMException will be thrown otherwise (for the send() method).
   *
   * When set: throws an "InvalidAccessError" DOMException if the synchronous flag is set and current global object is a Window object.
   */
  readonly timeout: number;
  /** Returns the associated XMLHttpRequestUpload object. It can be used to gather transmission information when data is transferred to a server. */
  readonly upload: XMLHttpRequestUpload;
  /**
   * True when credentials are to be included in a cross-origin request. False when they are to be excluded in a cross-origin request and when cookies are to be ignored in its response. Initially false.
   *
   * When set: throws an "InvalidStateError" DOMException if state is not unsent or opened, or if the send() flag is set.
   */
  readonly withCredentials: boolean;
  /** Cancels any network activity. */
  abort(): void;
  getAllResponseHeaders(): string;
  getResponseHeader(name: string): string | null;
  /**
   * Sets the request method, request URL, and synchronous flag.
   *
   * Throws a "SyntaxError" DOMException if either method is not a valid method or url cannot be parsed.
   *
   * Throws a "SecurityError" DOMException if method is a case-insensitive match for `CONNECT`, `TRACE`, or `TRACK`.
   *
   * Throws an "InvalidAccessError" DOMException if async is false, current global object is a Window object, and the timeout attribute is not zero or the responseType attribute is not the empty string.
   */
  open(method: string, url: string | URL): void;
  open(
    method: string,
    url: string | URL,
    async: boolean,
    username?: string | null,
    password?: string | null
  ): void;
  /**
   * Acts as if the `Content-Type` header value for a response is mime. (It does not change the header.)
   *
   * Throws an "InvalidStateError" DOMException if state is loading or done.
   */
  overrideMimeType(mime: string): void;
  /**
   * Initiates the request. The body argument provides the request body, if any, and is ignored if the request method is GET or HEAD.
   *
   * Throws an "InvalidStateError" DOMException if either state is not opened or the send() flag is set.
   */
  send(body?: Document | XMLHttpRequestBodyInit | null): void;
  /**
   * Combines a header in author request headers.
   *
   * Throws an "InvalidStateError" DOMException if either state is not opened or the send() flag is set.
   *
   * Throws a "SyntaxError" DOMException if name is not a header name or if value is not a header value.
   */
  setRequestHeader(name: string, value: string): void;
  readonly DONE: number;
  readonly HEADERS_RECEIVED: number;
  readonly LOADING: number;
  readonly OPENED: number;
  readonly UNSENT: number;
  addEventListener<K extends keyof XMLHttpRequestEventMap>(
    type: K,
    listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof XMLHttpRequestEventMap>(
    type: K,
    listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const XMLHttpRequest: {
  readonly prototype: XMLHttpRequest;
  new (): XMLHttpRequest;
  readonly DONE: number;
  readonly HEADERS_RECEIVED: number;
  readonly LOADING: number;
  readonly OPENED: number;
  readonly UNSENT: number;
};

interface XMLHttpRequestEventTargetEventMap {
  readonly abort: ProgressEvent<XMLHttpRequestEventTarget>;
  readonly error: ProgressEvent<XMLHttpRequestEventTarget>;
  readonly load: ProgressEvent<XMLHttpRequestEventTarget>;
  readonly loadend: ProgressEvent<XMLHttpRequestEventTarget>;
  readonly loadstart: ProgressEvent<XMLHttpRequestEventTarget>;
  readonly progress: ProgressEvent<XMLHttpRequestEventTarget>;
  readonly timeout: ProgressEvent<XMLHttpRequestEventTarget>;
}

interface XMLHttpRequestEventTarget extends EventTarget {
  readonly onabort:
    | ((this: XMLHttpRequest, ev: ProgressEvent) => unknown)
    | null;
  readonly onerror:
    | ((this: XMLHttpRequest, ev: ProgressEvent) => unknown)
    | null;
  readonly onload:
    | ((this: XMLHttpRequest, ev: ProgressEvent) => unknown)
    | null;
  readonly onloadend:
    | ((this: XMLHttpRequest, ev: ProgressEvent) => unknown)
    | null;
  readonly onloadstart:
    | ((this: XMLHttpRequest, ev: ProgressEvent) => unknown)
    | null;
  readonly onprogress:
    | ((this: XMLHttpRequest, ev: ProgressEvent) => unknown)
    | null;
  readonly ontimeout:
    | ((this: XMLHttpRequest, ev: ProgressEvent) => unknown)
    | null;
  addEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(
    type: K,
    listener: (
      this: XMLHttpRequestEventTarget,
      ev: XMLHttpRequestEventTargetEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(
    type: K,
    listener: (
      this: XMLHttpRequestEventTarget,
      ev: XMLHttpRequestEventTargetEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const XMLHttpRequestEventTarget: {
  readonly prototype: XMLHttpRequestEventTarget;
  new (): XMLHttpRequestEventTarget;
};

interface XMLHttpRequestUpload extends XMLHttpRequestEventTarget {
  addEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(
    type: K,
    listener: (
      this: XMLHttpRequestUpload,
      ev: XMLHttpRequestEventTargetEventMap[K]
    ) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(
    type: K,
    listener: (
      this: XMLHttpRequestUpload,
      ev: XMLHttpRequestEventTargetEventMap[K]
    ) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const XMLHttpRequestUpload: {
  readonly prototype: XMLHttpRequestUpload;
  new (): XMLHttpRequestUpload;
};

/** Provides the serializeToString() method to construct an XML string representing a DOM tree. */
interface XMLSerializer {
  serializeToString(root: Node): string;
}

declare const XMLSerializer: {
  readonly prototype: XMLSerializer;
  new (): XMLSerializer;
};

/** The XPathEvaluator interface allows to compile and evaluate XPath expressions. */
interface XPathEvaluator extends XPathEvaluatorBase {}

declare const XPathEvaluator: {
  readonly prototype: XPathEvaluator;
  new (): XPathEvaluator;
};

interface XPathEvaluatorBase {
  createExpression(
    expression: string,
    resolver?: XPathNSResolver | null
  ): XPathExpression;
  createNSResolver(nodeResolver: Node): XPathNSResolver;
  evaluate(
    expression: string,
    contextNode: Node,
    resolver?: XPathNSResolver | null,
    type?: number,
    result?: XPathResult | null
  ): XPathResult;
}

/** This interface is a compiled XPath expression that can be evaluated on a document or specific node to return information its DOM tree. */
interface XPathExpression {
  evaluate(
    contextNode: Node,
    type?: number,
    result?: XPathResult | null
  ): XPathResult;
}

declare const XPathExpression: {
  readonly prototype: XPathExpression;
  new (): XPathExpression;
};

/** The results generated by evaluating an XPath expression within the context of a given node. */
interface XPathResult {
  readonly booleanValue: boolean;
  readonly invalidIteratorState: boolean;
  readonly numberValue: number;
  readonly resultType: number;
  readonly singleNodeValue: Node | null;
  readonly snapshotLength: number;
  readonly stringValue: string;
  iterateNext(): Node | null;
  snapshotItem(index: number): Node | null;
  readonly ANY_TYPE: number;
  readonly ANY_UNORDERED_NODE_TYPE: number;
  readonly BOOLEAN_TYPE: number;
  readonly FIRST_ORDERED_NODE_TYPE: number;
  readonly NUMBER_TYPE: number;
  readonly ORDERED_NODE_ITERATOR_TYPE: number;
  readonly ORDERED_NODE_SNAPSHOT_TYPE: number;
  readonly STRING_TYPE: number;
  readonly UNORDERED_NODE_ITERATOR_TYPE: number;
  readonly UNORDERED_NODE_SNAPSHOT_TYPE: number;
}

declare const XPathResult: {
  readonly prototype: XPathResult;
  new (): XPathResult;
  readonly ANY_TYPE: number;
  readonly ANY_UNORDERED_NODE_TYPE: number;
  readonly BOOLEAN_TYPE: number;
  readonly FIRST_ORDERED_NODE_TYPE: number;
  readonly NUMBER_TYPE: number;
  readonly ORDERED_NODE_ITERATOR_TYPE: number;
  readonly ORDERED_NODE_SNAPSHOT_TYPE: number;
  readonly STRING_TYPE: number;
  readonly UNORDERED_NODE_ITERATOR_TYPE: number;
  readonly UNORDERED_NODE_SNAPSHOT_TYPE: number;
};

/** An XSLTProcessor applies an XSLT stylesheet transformation to an XML document to produce a new XML document as output. It has methods to load the XSLT stylesheet, to manipulate <xsl:param> parameter values, and to apply the transformation to documents. */
interface XSLTProcessor {
  clearParameters(): void;
  getParameter(namespaceURI: string | null, localName: string): unknown;
  importStylesheet(style: Node): void;
  removeParameter(namespaceURI: string | null, localName: string): void;
  reset(): void;
  setParameter(
    namespaceURI: string | null,
    localName: string,
    value: unknown
  ): void;
  transformToDocument(source: Node): Document;
  transformToFragment(source: Node, output: Document): DocumentFragment;
}

declare const XSLTProcessor: {
  readonly prototype: XSLTProcessor;
  new (): XSLTProcessor;
};

interface Console {
  assert(condition?: boolean, ...data: readonly unknown[]): void;
  clear(): void;
  count(label?: string): void;
  countReset(label?: string): void;
  debug(...data: readonly unknown[]): void;
  dir(item?: unknown, options?: unknown): void;
  dirxml(...data: readonly unknown[]): void;
  error(...data: readonly unknown[]): void;
  group(...data: readonly unknown[]): void;
  groupCollapsed(...data: readonly unknown[]): void;
  groupEnd(): void;
  info(...data: readonly unknown[]): void;
  log(...data: readonly unknown[]): void;
  table(tabularData?: unknown, properties?: readonly string[]): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
  timeLog(label?: string, ...data: readonly unknown[]): void;
  timeStamp(label?: string): void;
  trace(...data: readonly unknown[]): void;
  warn(...data: readonly unknown[]): void;
}

declare const console: Console;

/** Holds useful CSS-related methods. No object with this interface are implemented: it contains only static methods and therefore is a utilitarian interface. */
declare namespace CSS {
  function escape(ident: string): string;
  function supports(property: string, value: string): boolean;
  function supports(conditionText: string): boolean;
}

declare namespace WebAssembly {
  interface CompileError extends Error {}

  const CompileError: {
    readonly prototype: CompileError;
    new (message?: string): CompileError;
    (message?: string): CompileError;
  };

  interface Global {
    readonly value: unknown;
    valueOf(): unknown;
  }

  const Global: {
    readonly prototype: Global;
    new (descriptor: GlobalDescriptor, v?: unknown): Global;
  };

  interface Instance {
    readonly exports: Exports;
  }

  const Instance: {
    readonly prototype: Instance;
    new (module: Module, importObject?: Imports): Instance;
  };

  interface LinkError extends Error {}

  const LinkError: {
    readonly prototype: LinkError;
    new (message?: string): LinkError;
    (message?: string): LinkError;
  };

  interface Memory {
    readonly buffer: ArrayBuffer;
    grow(delta: number): number;
  }

  const Memory: {
    readonly prototype: Memory;
    new (descriptor: MemoryDescriptor): Memory;
  };

  interface Module {}

  const Module: {
    readonly prototype: Module;
    new (bytes: BufferSource): Module;
    customSections(
      moduleObject: Module,
      sectionName: string
    ): readonly ArrayBuffer[];
    exports(moduleObject: Module): readonly ModuleExportDescriptor[];
    imports(moduleObject: Module): readonly ModuleImportDescriptor[];
  };

  interface RuntimeError extends Error {}

  const RuntimeError: {
    readonly prototype: RuntimeError;
    new (message?: string): RuntimeError;
    (message?: string): RuntimeError;
  };

  interface Table {
    readonly length: number;
    get(index: number): unknown;
    grow(delta: number, value?: unknown): number;
    set(index: number, value?: unknown): void;
  }

  const Table: {
    readonly prototype: Table;
    new (descriptor: TableDescriptor, value?: unknown): Table;
  };

  interface GlobalDescriptor {
    readonly mutable?: boolean;
    readonly value: ValueType;
  }

  interface MemoryDescriptor {
    readonly initial: number;
    readonly maximum?: number;
    readonly shared?: boolean;
  }

  interface ModuleExportDescriptor {
    readonly kind: ImportExportKind;
    readonly name: string;
  }

  interface ModuleImportDescriptor {
    readonly kind: ImportExportKind;
    readonly module: string;
    readonly name: string;
  }

  interface TableDescriptor {
    readonly element: TableKind;
    readonly initial: number;
    readonly maximum?: number;
  }

  interface WebAssemblyInstantiatedSource {
    readonly instance: Instance;
    readonly module: Module;
  }

  type ImportExportKind = 'function' | 'global' | 'memory' | 'table';
  type TableKind = 'anyfunc' | 'externref';
  type ValueType =
    | 'anyfunc'
    | 'externref'
    | 'f32'
    | 'f64'
    | 'i32'
    | 'i64'
    | 'v128';
  type ExportValue = Function | Global | Memory | Table;
  type Exports = Record<string, ExportValue>;
  type ImportValue = ExportValue | number;
  type Imports = Record<string, ModuleImports>;
  type ModuleImports = Record<string, ImportValue>;
  function compile(bytes: BufferSource): Promise<Module>;
  function compileStreaming(
    source: Response | PromiseLike<Response>
  ): Promise<Module>;
  function instantiate(
    bytes: BufferSource,
    importObject?: Imports
  ): Promise<WebAssemblyInstantiatedSource>;
  function instantiate(
    moduleObject: Module,
    importObject?: Imports
  ): Promise<Instance>;
  function instantiateStreaming(
    source: Response | PromiseLike<Response>,
    importObject?: Imports
  ): Promise<WebAssemblyInstantiatedSource>;
  function validate(bytes: BufferSource): boolean;
}

interface BlobCallback {
  (blob: Blob | null): void;
}

interface CustomElementConstructor {
  new (...params: readonly unknown[]): HTMLElement;
}

interface DecodeErrorCallback {
  (error: DOMException): void;
}

interface DecodeSuccessCallback {
  (decodedData: AudioBuffer): void;
}

interface ErrorCallback {
  (err: DOMException): void;
}

interface FileCallback {
  (file: File): void;
}

interface FileSystemEntriesCallback {
  (entries: readonly FileSystemEntry[]): void;
}

interface FileSystemEntryCallback {
  (entry: FileSystemEntry): void;
}

interface FrameRequestCallback {
  (time: DOMHighResTimeStamp): void;
}

interface FunctionStringCallback {
  (data: string): void;
}

interface IdleRequestCallback {
  (deadline: IdleDeadline): void;
}

interface IntersectionObserverCallback {
  (
    entries: readonly IntersectionObserverEntry[],
    observer: IntersectionObserver
  ): void;
}

interface LockGrantedCallback {
  (lock: Lock | null): unknown;
}

interface MediaSessionActionHandler {
  (details: MediaSessionActionDetails): void;
}

interface MutationCallback {
  (mutations: readonly MutationRecord[], observer: MutationObserver): void;
}

interface NotificationPermissionCallback {
  (permission: NotificationPermission): void;
}

interface OnBeforeUnloadEventHandlerNonNull {
  (event: Event): string | null;
}

interface OnErrorEventHandlerNonNull {
  (
    event: Event | string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ): unknown;
}

interface PerformanceObserverCallback {
  (entries: PerformanceObserverEntryList, observer: PerformanceObserver): void;
}

interface PositionCallback {
  (position: GeolocationPosition): void;
}

interface PositionErrorCallback {
  (positionError: GeolocationPositionError): void;
}

interface QueuingStrategySize<T = unknown> {
  (chunk: T): number;
}

interface RTCPeerConnectionErrorCallback {
  (error: DOMException): void;
}

interface RTCSessionDescriptionCallback {
  (description: RTCSessionDescriptionInit): void;
}

interface RemotePlaybackAvailabilityCallback {
  (available: boolean): void;
}

interface ResizeObserverCallback {
  (entries: readonly ResizeObserverEntry[], observer: ResizeObserver): void;
}

interface TransformerFlushCallback<O> {
  (controller: TransformStreamDefaultController<O>): void | PromiseLike<void>;
}

interface TransformerStartCallback<O> {
  (controller: TransformStreamDefaultController<O>): unknown;
}

interface TransformerTransformCallback<I, O> {
  (
    chunk: I,
    controller: TransformStreamDefaultController<O>
  ): void | PromiseLike<void>;
}

interface UnderlyingSinkAbortCallback {
  (reason?: unknown): void | PromiseLike<void>;
}

interface UnderlyingSinkCloseCallback {
  (): void | PromiseLike<void>;
}

interface UnderlyingSinkStartCallback {
  (controller: WritableStreamDefaultController): unknown;
}

interface UnderlyingSinkWriteCallback<W> {
  (
    chunk: W,
    controller: WritableStreamDefaultController
  ): void | PromiseLike<void>;
}

interface UnderlyingSourceCancelCallback {
  (reason?: unknown): void | PromiseLike<void>;
}

interface UnderlyingSourcePullCallback<R> {
  (controller: ReadableStreamController<R>): void | PromiseLike<void>;
}

interface UnderlyingSourceStartCallback<R> {
  (controller: ReadableStreamController<R>): unknown;
}

interface VideoFrameRequestCallback {
  (now: DOMHighResTimeStamp, metadata: VideoFrameMetadata): void;
}

interface VoidFunction {
  (): void;
}

interface HTMLElementTagNameMap {
  readonly a: HTMLAnchorElement;
  readonly abbr: HTMLElement;
  readonly address: HTMLElement;
  readonly area: HTMLAreaElement;
  readonly article: HTMLElement;
  readonly aside: HTMLElement;
  readonly audio: HTMLAudioElement;
  readonly b: HTMLElement;
  readonly base: HTMLBaseElement;
  readonly bdi: HTMLElement;
  readonly bdo: HTMLElement;
  readonly blockquote: HTMLQuoteElement;
  readonly body: HTMLBodyElement;
  readonly br: HTMLBRElement;
  readonly button: HTMLButtonElement;
  readonly canvas: HTMLCanvasElement;
  readonly caption: HTMLTableCaptionElement;
  readonly cite: HTMLElement;
  readonly code: HTMLElement;
  readonly col: HTMLTableColElement;
  readonly colgroup: HTMLTableColElement;
  readonly data: HTMLDataElement;
  readonly datalist: HTMLDataListElement;
  readonly dd: HTMLElement;
  readonly del: HTMLModElement;
  readonly details: HTMLDetailsElement;
  readonly dfn: HTMLElement;
  readonly dialog: HTMLDialogElement;
  readonly dir: HTMLDirectoryElement;
  readonly div: HTMLDivElement;
  readonly dl: HTMLDListElement;
  readonly dt: HTMLElement;
  readonly em: HTMLElement;
  readonly embed: HTMLEmbedElement;
  readonly fieldset: HTMLFieldSetElement;
  readonly figcaption: HTMLElement;
  readonly figure: HTMLElement;
  readonly font: HTMLFontElement;
  readonly footer: HTMLElement;
  readonly form: HTMLFormElement;
  readonly frame: HTMLFrameElement;
  readonly frameset: HTMLFrameSetElement;
  readonly h1: HTMLHeadingElement;
  readonly h2: HTMLHeadingElement;
  readonly h3: HTMLHeadingElement;
  readonly h4: HTMLHeadingElement;
  readonly h5: HTMLHeadingElement;
  readonly h6: HTMLHeadingElement;
  readonly head: HTMLHeadElement;
  readonly header: HTMLElement;
  readonly hgroup: HTMLElement;
  readonly hr: HTMLHRElement;
  readonly html: HTMLHtmlElement;
  readonly i: HTMLElement;
  readonly iframe: HTMLIFrameElement;
  readonly img: HTMLImageElement;
  readonly input: HTMLInputElement;
  readonly ins: HTMLModElement;
  readonly kbd: HTMLElement;
  readonly label: HTMLLabelElement;
  readonly legend: HTMLLegendElement;
  readonly li: HTMLLIElement;
  readonly link: HTMLLinkElement;
  readonly main: HTMLElement;
  readonly map: HTMLMapElement;
  readonly mark: HTMLElement;
  readonly marquee: HTMLMarqueeElement;
  readonly menu: HTMLMenuElement;
  readonly meta: HTMLMetaElement;
  readonly meter: HTMLMeterElement;
  readonly nav: HTMLElement;
  readonly noscript: HTMLElement;
  readonly object: HTMLObjectElement;
  readonly ol: HTMLOListElement;
  readonly optgroup: HTMLOptGroupElement;
  readonly option: HTMLOptionElement;
  readonly output: HTMLOutputElement;
  readonly p: HTMLParagraphElement;
  readonly param: HTMLParamElement;
  readonly picture: HTMLPictureElement;
  readonly pre: HTMLPreElement;
  readonly progress: HTMLProgressElement;
  readonly q: HTMLQuoteElement;
  readonly rp: HTMLElement;
  readonly rt: HTMLElement;
  readonly ruby: HTMLElement;
  readonly s: HTMLElement;
  readonly samp: HTMLElement;
  readonly script: HTMLScriptElement;
  readonly section: HTMLElement;
  readonly select: HTMLSelectElement;
  readonly slot: HTMLSlotElement;
  readonly small: HTMLElement;
  readonly source: HTMLSourceElement;
  readonly span: HTMLSpanElement;
  readonly strong: HTMLElement;
  readonly style: HTMLStyleElement;
  readonly sub: HTMLElement;
  readonly summary: HTMLElement;
  readonly sup: HTMLElement;
  readonly table: HTMLTableElement;
  readonly tbody: HTMLTableSectionElement;
  readonly td: HTMLTableCellElement;
  readonly template: HTMLTemplateElement;
  readonly textarea: HTMLTextAreaElement;
  readonly tfoot: HTMLTableSectionElement;
  readonly th: HTMLTableCellElement;
  readonly thead: HTMLTableSectionElement;
  readonly time: HTMLTimeElement;
  readonly title: HTMLTitleElement;
  readonly tr: HTMLTableRowElement;
  readonly track: HTMLTrackElement;
  readonly u: HTMLElement;
  readonly ul: HTMLUListElement;
  readonly var: HTMLElement;
  readonly video: HTMLVideoElement;
  readonly wbr: HTMLElement;
}

interface HTMLElementDeprecatedTagNameMap {
  readonly listing: HTMLPreElement;
  readonly xmp: HTMLPreElement;
}

interface SVGElementTagNameMap {
  readonly a: SVGAElement;
  readonly animate: SVGAnimateElement;
  readonly animateMotion: SVGAnimateMotionElement;
  readonly animateTransform: SVGAnimateTransformElement;
  readonly circle: SVGCircleElement;
  readonly clipPath: SVGClipPathElement;
  readonly defs: SVGDefsElement;
  readonly desc: SVGDescElement;
  readonly ellipse: SVGEllipseElement;
  readonly feBlend: SVGFEBlendElement;
  readonly feColorMatrix: SVGFEColorMatrixElement;
  readonly feComponentTransfer: SVGFEComponentTransferElement;
  readonly feComposite: SVGFECompositeElement;
  readonly feConvolveMatrix: SVGFEConvolveMatrixElement;
  readonly feDiffuseLighting: SVGFEDiffuseLightingElement;
  readonly feDisplacementMap: SVGFEDisplacementMapElement;
  readonly feDistantLight: SVGFEDistantLightElement;
  readonly feDropShadow: SVGFEDropShadowElement;
  readonly feFlood: SVGFEFloodElement;
  readonly feFuncA: SVGFEFuncAElement;
  readonly feFuncB: SVGFEFuncBElement;
  readonly feFuncG: SVGFEFuncGElement;
  readonly feFuncR: SVGFEFuncRElement;
  readonly feGaussianBlur: SVGFEGaussianBlurElement;
  readonly feImage: SVGFEImageElement;
  readonly feMerge: SVGFEMergeElement;
  readonly feMergeNode: SVGFEMergeNodeElement;
  readonly feMorphology: SVGFEMorphologyElement;
  readonly feOffset: SVGFEOffsetElement;
  readonly fePointLight: SVGFEPointLightElement;
  readonly feSpecularLighting: SVGFESpecularLightingElement;
  readonly feSpotLight: SVGFESpotLightElement;
  readonly feTile: SVGFETileElement;
  readonly feTurbulence: SVGFETurbulenceElement;
  readonly filter: SVGFilterElement;
  readonly foreignObject: SVGForeignObjectElement;
  readonly g: SVGGElement;
  readonly image: SVGImageElement;
  readonly line: SVGLineElement;
  readonly linearGradient: SVGLinearGradientElement;
  readonly marker: SVGMarkerElement;
  readonly mask: SVGMaskElement;
  readonly metadata: SVGMetadataElement;
  readonly mpath: SVGMPathElement;
  readonly path: SVGPathElement;
  readonly pattern: SVGPatternElement;
  readonly polygon: SVGPolygonElement;
  readonly polyline: SVGPolylineElement;
  readonly radialGradient: SVGRadialGradientElement;
  readonly rect: SVGRectElement;
  readonly script: SVGScriptElement;
  readonly set: SVGSetElement;
  readonly stop: SVGStopElement;
  readonly style: SVGStyleElement;
  readonly svg: SVGSVGElement;
  readonly switch: SVGSwitchElement;
  readonly symbol: SVGSymbolElement;
  readonly text: SVGTextElement;
  readonly textPath: SVGTextPathElement;
  readonly title: SVGTitleElement;
  readonly tspan: SVGTSpanElement;
  readonly use: SVGUseElement;
  readonly view: SVGViewElement;
}

/** @deprecated Directly use HTMLElementTagNameMap or SVGElementTagNameMap as appropriate, instead. */
type ElementTagNameMap = HTMLElementTagNameMap &
  Pick<
    SVGElementTagNameMap,
    Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>
  >;

declare const Audio: {
  new (src?: string): HTMLAudioElement;
};
declare const Image: {
  new (width?: number, height?: number): HTMLImageElement;
};
declare const Option: {
  new (
    text?: string,
    value?: string,
    defaultSelected?: boolean,
    selected?: boolean
  ): HTMLOptionElement;
};
/** @deprecated This is a legacy alias of `navigator`. */
declare const clientInformation: Navigator;
/** Returns true if the window has been closed, false otherwise. */
declare const closed: boolean;
/** Defines a new custom element, mapping the given name to the given constructor as an autonomous custom element. */
declare const customElements: CustomElementRegistry;
declare const devicePixelRatio: number;
declare const document: Document;
/** @deprecated */
declare const event: Event | undefined;
/** @deprecated */
declare const external: External;
declare const frameElement: Element | null;
declare const frames: WindowProxy;
declare const history: History;
declare const innerHeight: number;
declare const innerWidth: number;
declare const length: number;
declare const location: Location;
/** Returns true if the location bar is visible; otherwise, returns false. */
declare const locationbar: BarProp;
/** Returns true if the menu bar is visible; otherwise, returns false. */
declare const menubar: BarProp;
/** @deprecated */
declare const name: void;
declare const navigator: Navigator;
/** Available only in secure contexts. */
declare const ondevicemotion:
  | ((this: Window, ev: DeviceMotionEvent) => unknown)
  | null;
/** Available only in secure contexts. */
declare const ondeviceorientation:
  | ((this: Window, ev: DeviceOrientationEvent) => unknown)
  | null;
/** @deprecated */
declare const onorientationchange:
  | ((this: Window, ev: Event) => unknown)
  | null;
declare const opener: unknown;
/** @deprecated */
declare const orientation: number;
declare const outerHeight: number;
declare const outerWidth: number;
/** @deprecated This is a legacy alias of `scrollX`. */
declare const pageXOffset: number;
/** @deprecated This is a legacy alias of `scrollY`. */
declare const pageYOffset: number;
/**
 * Refers to either the parent WindowProxy, or itself.
 *
 * It can rarely be null e.g. for contentWindow of an iframe that is already removed from the parent.
 */
declare const parent: WindowProxy;
/** Returns true if the personal bar is visible; otherwise, returns false. */
declare const personalbar: BarProp;
declare const screen: Screen;
declare const screenLeft: number;
declare const screenTop: number;
declare const screenX: number;
declare const screenY: number;
declare const scrollX: number;
declare const scrollY: number;
/** Returns true if the scrollbars are visible; otherwise, returns false. */
declare const scrollbars: BarProp;
declare const self: Window & typeof globalThis;
declare const speechSynthesis: SpeechSynthesis;
/** @deprecated */
declare const status: string;
/** Returns true if the status bar is visible; otherwise, returns false. */
declare const statusbar: BarProp;
/** Returns true if the toolbar is visible; otherwise, returns false. */
declare const toolbar: BarProp;
declare const top: WindowProxy | null;
declare const visualViewport: VisualViewport;
declare const window: Window & typeof globalThis;
declare function alert(message?: unknown): void;
declare function blur(): void;
declare function cancelIdleCallback(handle: number): void;
/** @deprecated */
declare function captureEvents(): void;
/** Closes the window. */
declare function close(): void;
declare function confirm(message?: string): boolean;
/** Moves the focus to the window's browsing context, if any. */
declare function focus(): void;
declare function getComputedStyle(
  elt: Element,
  pseudoElt?: string | null
): CSSStyleDeclaration;
declare function getSelection(): Selection | null;
declare function matchMedia(query: string): MediaQueryList;
declare function moveBy(x: number, y: number): void;
declare function moveTo(x: number, y: number): void;
declare function open(
  url?: string | URL,
  target?: string,
  features?: string
): WindowProxy | null;
/**
 * Posts a message to the given window. Messages can be structured objects, e.g. nested objects and arrays, can contain JavaScript values (strings, numbers, Date objects, etc), and can contain certain data objects such as File Blob, FileList, and ArrayBuffer objects.
 *
 * Objects listed in the transfer member of options are transferred, not just cloned, meaning that they are no longer usable on the sending side.
 *
 * A target origin can be specified using the targetOrigin member of options. If not provided, it defaults to "/". This default restricts the message to same-origin targets only.
 *
 * If the origin of the target window doesn't match the given target origin, the message is discarded, to avoid information leakage. To send the message to the target regardless of origin, set the target origin to "*".
 *
 * Throws a "DataCloneError" DOMException if transfer array contains duplicate objects or if message could not be cloned.
 */
declare function postMessage(
  message: unknown,
  targetOrigin: string,
  transfer?: readonly Transferable[]
): void;
declare function postMessage(
  message: unknown,
  options?: WindowPostMessageOptions
): void;
declare function print(): void;
declare function prompt(message?: string, _default?: string): string | null;
/** @deprecated */
declare function releaseEvents(): void;
declare function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number;
declare function resizeBy(x: number, y: number): void;
declare function resizeTo(width: number, height: number): void;
declare function scroll(options?: ScrollToOptions): void;
declare function scroll(x: number, y: number): void;
declare function scrollBy(options?: ScrollToOptions): void;
declare function scrollBy(x: number, y: number): void;
declare function scrollTo(options?: ScrollToOptions): void;
declare function scrollTo(x: number, y: number): void;
/** Cancels the document load. */
declare function stop(): void;
declare function toString(): string;
/** Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise. */
declare function dispatchEvent(event: Event): boolean;
declare function cancelAnimationFrame(handle: number): void;
declare function requestAnimationFrame(callback: FrameRequestCallback): number;
/**
 * Fires when the user aborts the download.
 * @param ev The event.
 */
declare const onabort: ((this: Window, ev: UIEvent) => unknown) | null;
declare const onanimationcancel:
  | ((this: Window, ev: AnimationEvent) => unknown)
  | null;
declare const onanimationend:
  | ((this: Window, ev: AnimationEvent) => unknown)
  | null;
declare const onanimationiteration:
  | ((this: Window, ev: AnimationEvent) => unknown)
  | null;
declare const onanimationstart:
  | ((this: Window, ev: AnimationEvent) => unknown)
  | null;
declare const onauxclick: ((this: Window, ev: MouseEvent) => unknown) | null;
/**
 * Fires when the object loses the input focus.
 * @param ev The focus event.
 */
declare const onblur: ((this: Window, ev: FocusEvent) => unknown) | null;
/**
 * Occurs when playback is possible, but would require further buffering.
 * @param ev The event.
 */
declare const oncanplay: ((this: Window, ev: Event) => unknown) | null;
declare const oncanplaythrough: ((this: Window, ev: Event) => unknown) | null;
/**
 * Fires when the contents of the object or selection have changed.
 * @param ev The event.
 */
declare const onchange: ((this: Window, ev: Event) => unknown) | null;
/**
 * Fires when the user clicks the left mouse button on the object
 * @param ev The mouse event.
 */
declare const onclick: ((this: Window, ev: MouseEvent) => unknown) | null;
declare const onclose: ((this: Window, ev: Event) => unknown) | null;
/**
 * Fires when the user clicks the right mouse button in the client area, opening the context menu.
 * @param ev The mouse event.
 */
declare const oncontextmenu: ((this: Window, ev: MouseEvent) => unknown) | null;
declare const oncuechange: ((this: Window, ev: Event) => unknown) | null;
/**
 * Fires when the user double-clicks the object.
 * @param ev The mouse event.
 */
declare const ondblclick: ((this: Window, ev: MouseEvent) => unknown) | null;
/**
 * Fires on the source object continuously during a drag operation.
 * @param ev The event.
 */
declare const ondrag: ((this: Window, ev: DragEvent) => unknown) | null;
/**
 * Fires on the source object when the user releases the mouse at the close of a drag operation.
 * @param ev The event.
 */
declare const ondragend: ((this: Window, ev: DragEvent) => unknown) | null;
/**
 * Fires on the target element when the user drags the object to a valid drop target.
 * @param ev The drag event.
 */
declare const ondragenter: ((this: Window, ev: DragEvent) => unknown) | null;
/**
 * Fires on the target object when the user moves the mouse out of a valid drop target during a drag operation.
 * @param ev The drag event.
 */
declare const ondragleave: ((this: Window, ev: DragEvent) => unknown) | null;
/**
 * Fires on the target element continuously while the user drags the object over a valid drop target.
 * @param ev The event.
 */
declare const ondragover: ((this: Window, ev: DragEvent) => unknown) | null;
/**
 * Fires on the source object when the user starts to drag a text selection or selected object.
 * @param ev The event.
 */
declare const ondragstart: ((this: Window, ev: DragEvent) => unknown) | null;
declare const ondrop: ((this: Window, ev: DragEvent) => unknown) | null;
/**
 * Occurs when the duration attribute is updated.
 * @param ev The event.
 */
declare const ondurationchange: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when the media element is reset to its initial state.
 * @param ev The event.
 */
declare const onemptied: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when the end of playback is reached.
 * @param ev The event
 */
declare const onended: ((this: Window, ev: Event) => unknown) | null;
/**
 * Fires when an error occurs during object loading.
 * @param ev The event.
 */
declare const onerror: OnErrorEventHandler;
/**
 * Fires when the object receives focus.
 * @param ev The event.
 */
declare const onfocus: ((this: Window, ev: FocusEvent) => unknown) | null;
declare const onformdata: ((this: Window, ev: FormDataEvent) => unknown) | null;
declare const ongotpointercapture:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
declare const oninput: ((this: Window, ev: Event) => unknown) | null;
declare const oninvalid: ((this: Window, ev: Event) => unknown) | null;
/**
 * Fires when the user presses a key.
 * @param ev The keyboard event
 */
declare const onkeydown: ((this: Window, ev: KeyboardEvent) => unknown) | null;
/**
 * Fires when the user presses an alphanumeric key.
 * @param ev The event.
 * @deprecated
 */
declare const onkeypress: ((this: Window, ev: KeyboardEvent) => unknown) | null;
/**
 * Fires when the user releases a key.
 * @param ev The keyboard event
 */
declare const onkeyup: ((this: Window, ev: KeyboardEvent) => unknown) | null;
/**
 * Fires immediately after the browser loads the object.
 * @param ev The event.
 */
declare const onload: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when media data is loaded at the current playback position.
 * @param ev The event.
 */
declare const onloadeddata: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when the duration and dimensions of the media have been determined.
 * @param ev The event.
 */
declare const onloadedmetadata: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when Internet Explorer begins looking for media data.
 * @param ev The event.
 */
declare const onloadstart: ((this: Window, ev: Event) => unknown) | null;
declare const onlostpointercapture:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
/**
 * Fires when the user clicks the object with either mouse button.
 * @param ev The mouse event.
 */
declare const onmousedown: ((this: Window, ev: MouseEvent) => unknown) | null;
declare const onmouseenter: ((this: Window, ev: MouseEvent) => unknown) | null;
declare const onmouseleave: ((this: Window, ev: MouseEvent) => unknown) | null;
/**
 * Fires when the user moves the mouse over the object.
 * @param ev The mouse event.
 */
declare const onmousemove: ((this: Window, ev: MouseEvent) => unknown) | null;
/**
 * Fires when the user moves the mouse pointer outside the boundaries of the object.
 * @param ev The mouse event.
 */
declare const onmouseout: ((this: Window, ev: MouseEvent) => unknown) | null;
/**
 * Fires when the user moves the mouse pointer into the object.
 * @param ev The mouse event.
 */
declare const onmouseover: ((this: Window, ev: MouseEvent) => unknown) | null;
/**
 * Fires when the user releases a mouse button while the mouse is over the object.
 * @param ev The mouse event.
 */
declare const onmouseup: ((this: Window, ev: MouseEvent) => unknown) | null;
/**
 * Occurs when playback is paused.
 * @param ev The event.
 */
declare const onpause: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when the play method is requested.
 * @param ev The event.
 */
declare const onplay: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when the audio or video has started playing.
 * @param ev The event.
 */
declare const onplaying: ((this: Window, ev: Event) => unknown) | null;
declare const onpointercancel:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
declare const onpointerdown:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
declare const onpointerenter:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
declare const onpointerleave:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
declare const onpointermove:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
declare const onpointerout:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
declare const onpointerover:
  | ((this: Window, ev: PointerEvent) => unknown)
  | null;
declare const onpointerup: ((this: Window, ev: PointerEvent) => unknown) | null;
/**
 * Occurs to indicate progress while downloading media data.
 * @param ev The event.
 */
declare const onprogress: ((this: Window, ev: ProgressEvent) => unknown) | null;
/**
 * Occurs when the playback rate is increased or decreased.
 * @param ev The event.
 */
declare const onratechange: ((this: Window, ev: Event) => unknown) | null;
/**
 * Fires when the user resets a form.
 * @param ev The event.
 */
declare const onreset: ((this: Window, ev: Event) => unknown) | null;
declare const onresize: ((this: Window, ev: UIEvent) => unknown) | null;
/**
 * Fires when the user repositions the scroll box in the scroll bar on the object.
 * @param ev The event.
 */
declare const onscroll: ((this: Window, ev: Event) => unknown) | null;
declare const onsecuritypolicyviolation:
  | ((this: Window, ev: SecurityPolicyViolationEvent) => unknown)
  | null;
/**
 * Occurs when the seek operation ends.
 * @param ev The event.
 */
declare const onseeked: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when the current playback position is moved.
 * @param ev The event.
 */
declare const onseeking: ((this: Window, ev: Event) => unknown) | null;
/**
 * Fires when the current selection changes.
 * @param ev The event.
 */
declare const onselect: ((this: Window, ev: Event) => unknown) | null;
declare const onselectionchange: ((this: Window, ev: Event) => unknown) | null;
declare const onselectstart: ((this: Window, ev: Event) => unknown) | null;
declare const onslotchange: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when the download has stopped.
 * @param ev The event.
 */
declare const onstalled: ((this: Window, ev: Event) => unknown) | null;
declare const onsubmit: ((this: Window, ev: SubmitEvent) => unknown) | null;
/**
 * Occurs if the load operation has been intentionally halted.
 * @param ev The event.
 */
declare const onsuspend: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs to indicate the current playback position.
 * @param ev The event.
 */
declare const ontimeupdate: ((this: Window, ev: Event) => unknown) | null;
declare const ontoggle: ((this: Window, ev: Event) => unknown) | null;
declare const ontouchcancel:
  | ((this: Window, ev: TouchEvent) => unknown)
  | null
  | undefined;
declare const ontouchend:
  | ((this: Window, ev: TouchEvent) => unknown)
  | null
  | undefined;
declare const ontouchmove:
  | ((this: Window, ev: TouchEvent) => unknown)
  | null
  | undefined;
declare const ontouchstart:
  | ((this: Window, ev: TouchEvent) => unknown)
  | null
  | undefined;
declare const ontransitioncancel:
  | ((this: Window, ev: TransitionEvent) => unknown)
  | null;
declare const ontransitionend:
  | ((this: Window, ev: TransitionEvent) => unknown)
  | null;
declare const ontransitionrun:
  | ((this: Window, ev: TransitionEvent) => unknown)
  | null;
declare const ontransitionstart:
  | ((this: Window, ev: TransitionEvent) => unknown)
  | null;
/**
 * Occurs when the volume is changed, or playback is muted or unmuted.
 * @param ev The event.
 */
declare const onvolumechange: ((this: Window, ev: Event) => unknown) | null;
/**
 * Occurs when playback stops because the next frame of a video resource is not available.
 * @param ev The event.
 */
declare const onwaiting: ((this: Window, ev: Event) => unknown) | null;
/** @deprecated This is a legacy alias of `onanimationend`. */
declare const onwebkitanimationend:
  | ((this: Window, ev: Event) => unknown)
  | null;
/** @deprecated This is a legacy alias of `onanimationiteration`. */
declare const onwebkitanimationiteration:
  | ((this: Window, ev: Event) => unknown)
  | null;
/** @deprecated This is a legacy alias of `onanimationstart`. */
declare const onwebkitanimationstart:
  | ((this: Window, ev: Event) => unknown)
  | null;
/** @deprecated This is a legacy alias of `ontransitionend`. */
declare const onwebkittransitionend:
  | ((this: Window, ev: Event) => unknown)
  | null;
declare const onwheel: ((this: Window, ev: WheelEvent) => unknown) | null;
declare const onafterprint: ((this: Window, ev: Event) => unknown) | null;
declare const onbeforeprint: ((this: Window, ev: Event) => unknown) | null;
declare const onbeforeunload:
  | ((this: Window, ev: BeforeUnloadEvent) => unknown)
  | null;
declare const ongamepadconnected:
  | ((this: Window, ev: GamepadEvent) => unknown)
  | null;
declare const ongamepaddisconnected:
  | ((this: Window, ev: GamepadEvent) => unknown)
  | null;
declare const onhashchange:
  | ((this: Window, ev: HashChangeEvent) => unknown)
  | null;
declare const onlanguagechange: ((this: Window, ev: Event) => unknown) | null;
declare const onmessage: ((this: Window, ev: MessageEvent) => unknown) | null;
declare const onmessageerror:
  | ((this: Window, ev: MessageEvent) => unknown)
  | null;
declare const onoffline: ((this: Window, ev: Event) => unknown) | null;
declare const ononline: ((this: Window, ev: Event) => unknown) | null;
declare const onpagehide:
  | ((this: Window, ev: PageTransitionEvent) => unknown)
  | null;
declare const onpageshow:
  | ((this: Window, ev: PageTransitionEvent) => unknown)
  | null;
declare const onpopstate: ((this: Window, ev: PopStateEvent) => unknown) | null;
declare const onrejectionhandled:
  | ((this: Window, ev: PromiseRejectionEvent) => unknown)
  | null;
declare const onstorage: ((this: Window, ev: StorageEvent) => unknown) | null;
declare const onunhandledrejection:
  | ((this: Window, ev: PromiseRejectionEvent) => unknown)
  | null;
declare const onunload: ((this: Window, ev: Event) => unknown) | null;
declare const localStorage: Storage;
/** Available only in secure contexts. */
declare const caches: CacheStorage;
declare const crossOriginIsolated: boolean;
declare const crypto: Crypto;
declare const indexedDB: IDBFactory;
declare const isSecureContext: boolean;
declare const origin: string;
declare const performance: Performance;
declare function atob(data: string): string;
declare function btoa(data: string): string;
declare function clearInterval(id?: number): void;
declare function clearTimeout(id?: number): void;
declare function createImageBitmap(
  image: ImageBitmapSource,
  options?: ImageBitmapOptions
): Promise<ImageBitmap>;
declare function createImageBitmap(
  image: ImageBitmapSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  options?: ImageBitmapOptions
): Promise<ImageBitmap>;
declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response>;
declare function queueMicrotask(callback: VoidFunction): void;
declare function reportError(e: unknown): void;
declare function setInterval(
  handler: TimerHandler,
  timeout?: number,
  ...arguments: readonly unknown[]
): number;
declare function setTimeout(
  handler: TimerHandler,
  timeout?: number,
  ...arguments: readonly unknown[]
): number;
declare function structuredClone(
  value: unknown,
  options?: StructuredSerializeOptions
): unknown;
declare const sessionStorage: Storage;
declare function addEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => unknown,
  options?: boolean | AddEventListenerOptions
): void;
declare function addEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void;
declare function removeEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => unknown,
  options?: boolean | EventListenerOptions
): void;
declare function removeEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
): void;
type AlgorithmIdentifier = Algorithm | string;
type BigInteger = Uint8Array;
type BinaryData = ArrayBuffer | ArrayBufferView;
type BlobPart = BufferSource | Blob | string;
type BodyInit = ReadableStream | XMLHttpRequestBodyInit;
type BufferSource = ArrayBufferView | ArrayBuffer;
type COSEAlgorithmIdentifier = number;
type CSSNumberish = number;
type CanvasImageSource =
  | HTMLOrSVGImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | ImageBitmap;
type ClipboardItemData = Promise<string | Blob>;
type ClipboardItems = readonly ClipboardItem[];
type ConstrainBoolean = boolean | ConstrainBooleanParameters;
type ConstrainDOMString =
  | string
  | readonly string[]
  | ConstrainDOMStringParameters;
type ConstrainDouble = number | ConstrainDoubleRange;
type ConstrainULong = number | ConstrainULongRange;
type DOMHighResTimeStamp = number;
type EpochTimeStamp = number;
type EventListenerOrEventListenerObject = EventListener | EventListenerObject;
type Float32List = Float32Array | readonly GLfloat[];
type FormDataEntryValue = File | string;
type GLbitfield = number;
type GLboolean = boolean;
type GLclampf = number;
type GLenum = number;
type GLfloat = number;
type GLint = number;
type GLint64 = number;
type GLintptr = number;
type GLsizei = number;
type GLsizeiptr = number;
type GLuint = number;
type GLuint64 = number;
type HTMLOrSVGImageElement = HTMLImageElement | SVGImageElement;
type HTMLOrSVGScriptElement = HTMLScriptElement | SVGScriptElement;
type HashAlgorithmIdentifier = AlgorithmIdentifier;
type HeadersInit =
  | readonly (readonly string[])[]
  | Record<string, string>
  | Headers;
type IDBValidKey =
  | number
  | string
  | Date
  | BufferSource
  | readonly IDBValidKey[];
type ImageBitmapSource = CanvasImageSource | Blob | ImageData;
type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
type Int32List = Int32Array | readonly GLint[];
type LineAndPositionSetting = number | AutoKeyword;
type MediaProvider = MediaStream | MediaSource | Blob;
type MessageEventSource = WindowProxy | MessagePort | ServiceWorker;
type MutationRecordType = 'attributes' | 'characterData' | 'childList';
type NamedCurve = string;
type OnBeforeUnloadEventHandler = OnBeforeUnloadEventHandlerNonNull | null;
type OnErrorEventHandler = OnErrorEventHandlerNonNull | null;
type PerformanceEntryList = readonly PerformanceEntry[];
type ReadableStreamController<T> = ReadableStreamDefaultController<T>;
type ReadableStreamDefaultReadResult<T> =
  | ReadableStreamDefaultReadValueResult<T>
  | ReadableStreamDefaultReadDoneResult;
type ReadableStreamReader<T> = ReadableStreamDefaultReader<T>;
type RenderingContext =
  | CanvasRenderingContext2D
  | ImageBitmapRenderingContext
  | WebGLRenderingContext
  | WebGL2RenderingContext;
type RequestInfo = Request | string;
type TexImageSource =
  | ImageBitmap
  | ImageData
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement;
type TimerHandler = string | Function;
type Transferable = ArrayBuffer | MessagePort | ImageBitmap;
type Uint32List = Uint32Array | readonly GLuint[];
type UvmEntries = readonly UvmEntry[];
type UvmEntry = readonly number[];
type VibratePattern = number | readonly number[];
type WindowProxy = Window;
type XMLHttpRequestBodyInit =
  | Blob
  | BufferSource
  | FormData
  | URLSearchParams
  | string;
type AlignSetting = 'center' | 'end' | 'left' | 'right' | 'start';
type AnimationPlayState = 'finished' | 'idle' | 'paused' | 'running';
type AnimationReplaceState = 'active' | 'persisted' | 'removed';
type AppendMode = 'segments' | 'sequence';
type AttestationConveyancePreference =
  | 'direct'
  | 'enterprise'
  | 'indirect'
  | 'none';
type AudioContextLatencyCategory = 'balanced' | 'interactive' | 'playback';
type AudioContextState = 'closed' | 'running' | 'suspended';
type AuthenticatorAttachment = 'cross-platform' | 'platform';
type AuthenticatorTransport = 'ble' | 'internal' | 'nfc' | 'usb';
type AutoKeyword = 'auto';
type AutomationRate = 'a-rate' | 'k-rate';
type BinaryType = 'arraybuffer' | 'blob';
type BiquadFilterType =
  | 'allpass'
  | 'bandpass'
  | 'highpass'
  | 'highshelf'
  | 'lowpass'
  | 'lowshelf'
  | 'notch'
  | 'peaking';
type CanPlayTypeResult = '' | 'maybe' | 'probably';
type CanvasDirection = 'inherit' | 'ltr' | 'rtl';
type CanvasFillRule = 'evenodd' | 'nonzero';
type CanvasFontKerning = 'auto' | 'none' | 'normal';
type CanvasFontStretch =
  | 'condensed'
  | 'expanded'
  | 'extra-condensed'
  | 'extra-expanded'
  | 'normal'
  | 'semi-condensed'
  | 'semi-expanded'
  | 'ultra-condensed'
  | 'ultra-expanded';
type CanvasFontVariantCaps =
  | 'all-petite-caps'
  | 'all-small-caps'
  | 'normal'
  | 'petite-caps'
  | 'small-caps'
  | 'titling-caps'
  | 'unicase';
type CanvasLineCap = 'butt' | 'round' | 'square';
type CanvasLineJoin = 'bevel' | 'miter' | 'round';
type CanvasTextAlign = 'center' | 'end' | 'left' | 'right' | 'start';
type CanvasTextBaseline =
  | 'alphabetic'
  | 'bottom'
  | 'hanging'
  | 'ideographic'
  | 'middle'
  | 'top';
type CanvasTextRendering =
  | 'auto'
  | 'geometricPrecision'
  | 'optimizeLegibility'
  | 'optimizeSpeed';
type ChannelCountMode = 'clamped-max' | 'explicit' | 'max';
type ChannelInterpretation = 'discrete' | 'speakers';
type ClientTypes = 'all' | 'sharedworker' | 'window' | 'worker';
type ColorGamut = 'p3' | 'rec2020' | 'srgb';
type ColorSpaceConversion = 'default' | 'none';
type CompositeOperation = 'accumulate' | 'add' | 'replace';
type CompositeOperationOrAuto = 'accumulate' | 'add' | 'auto' | 'replace';
type ConnectionType =
  | 'bluetooth'
  | 'cellular'
  | 'ethernet'
  | 'mixed'
  | 'none'
  | 'other'
  | 'unknown'
  | 'wifi';
type CredentialMediationRequirement = 'optional' | 'required' | 'silent';
type DOMParserSupportedType =
  | 'application/xhtml+xml'
  | 'application/xml'
  | 'image/svg+xml'
  | 'text/html'
  | 'text/xml';
type DirectionSetting = '' | 'lr' | 'rl';
type DisplayCaptureSurfaceType =
  | 'application'
  | 'browser'
  | 'monitor'
  | 'window';
type DistanceModelType = 'exponential' | 'inverse' | 'linear';
type DocumentReadyState = 'complete' | 'interactive' | 'loading';
type DocumentVisibilityState = 'hidden' | 'visible';
type EndOfStreamError = 'decode' | 'network';
type EndingType = 'native' | 'transparent';
type FileSystemHandleKind = 'directory' | 'file';
type FillMode = 'auto' | 'backwards' | 'both' | 'forwards' | 'none';
type FontFaceLoadStatus = 'error' | 'loaded' | 'loading' | 'unloaded';
type FontFaceSetLoadStatus = 'loaded' | 'loading';
type FullscreenNavigationUI = 'auto' | 'hide' | 'show';
type GamepadHapticActuatorType = 'vibration';
type GamepadMappingType = '' | 'standard' | 'xr-standard';
type GlobalCompositeOperation =
  | 'color'
  | 'color-burn'
  | 'color-dodge'
  | 'copy'
  | 'darken'
  | 'destination-atop'
  | 'destination-in'
  | 'destination-out'
  | 'destination-over'
  | 'difference'
  | 'exclusion'
  | 'hard-light'
  | 'hue'
  | 'lighten'
  | 'lighter'
  | 'luminosity'
  | 'multiply'
  | 'overlay'
  | 'saturation'
  | 'screen'
  | 'soft-light'
  | 'source-atop'
  | 'source-in'
  | 'source-out'
  | 'source-over'
  | 'xor';
type HdrMetadataType = 'smpteSt2086' | 'smpteSt2094-10' | 'smpteSt2094-40';
type IDBCursorDirection = 'next' | 'nextunique' | 'prev' | 'prevunique';
type IDBRequestReadyState = 'done' | 'pending';
type IDBTransactionDurability = 'default' | 'relaxed' | 'strict';
type IDBTransactionMode = 'readonly' | 'readwrite' | 'versionchange';
type ImageOrientation = 'flipY' | 'none';
type ImageSmoothingQuality = 'high' | 'low' | 'medium';
type IterationCompositeOperation = 'accumulate' | 'replace';
type KeyFormat = 'jwk' | 'pkcs8' | 'raw' | 'spki';
type KeyType = 'private' | 'public' | 'secret';
type KeyUsage =
  | 'decrypt'
  | 'deriveBits'
  | 'deriveKey'
  | 'encrypt'
  | 'sign'
  | 'unwrapKey'
  | 'verify'
  | 'wrapKey';
type LineAlignSetting = 'center' | 'end' | 'start';
type LockMode = 'exclusive' | 'shared';
type MIDIPortConnectionState = 'closed' | 'open' | 'pending';
type MIDIPortDeviceState = 'connected' | 'disconnected';
type MIDIPortType = 'input' | 'output';
type MediaDecodingType = 'file' | 'media-source' | 'webrtc';
type MediaDeviceKind = 'audioinput' | 'audiooutput' | 'videoinput';
type MediaEncodingType = 'record' | 'webrtc';
type MediaKeyMessageType =
  | 'individualization-request'
  | 'license-release'
  | 'license-renewal'
  | 'license-request';
type MediaKeySessionClosedReason =
  | 'closed-by-application'
  | 'hardware-context-reset'
  | 'internal-error'
  | 'release-acknowledged'
  | 'resource-evicted';
type MediaKeySessionType = 'persistent-license' | 'temporary';
type MediaKeyStatus =
  | 'expired'
  | 'internal-error'
  | 'output-downscaled'
  | 'output-restricted'
  | 'released'
  | 'status-pending'
  | 'usable'
  | 'usable-in-future';
type MediaKeysRequirement = 'not-allowed' | 'optional' | 'required';
type MediaSessionAction =
  | 'hangup'
  | 'nexttrack'
  | 'pause'
  | 'play'
  | 'previoustrack'
  | 'seekbackward'
  | 'seekforward'
  | 'seekto'
  | 'skipad'
  | 'stop'
  | 'togglecamera'
  | 'togglemicrophone';
type MediaSessionPlaybackState = 'none' | 'paused' | 'playing';
type MediaStreamTrackState = 'ended' | 'live';
type NavigationTimingType =
  | 'back_forward'
  | 'navigate'
  | 'prerender'
  | 'reload';
type NotificationDirection = 'auto' | 'ltr' | 'rtl';
type NotificationPermission = 'default' | 'denied' | 'granted';
type OrientationLockType =
  | 'any'
  | 'landscape'
  | 'landscape-primary'
  | 'landscape-secondary'
  | 'natural'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary';
type OrientationType =
  | 'landscape-primary'
  | 'landscape-secondary'
  | 'portrait-primary'
  | 'portrait-secondary';
type OscillatorType = 'custom' | 'sawtooth' | 'sine' | 'square' | 'triangle';
type OverSampleType = '2x' | '4x' | 'none';
type PanningModelType = 'HRTF' | 'equalpower';
type PaymentComplete = 'fail' | 'success' | 'unknown';
type PermissionName =
  | 'geolocation'
  | 'notifications'
  | 'persistent-storage'
  | 'push'
  | 'screen-wake-lock'
  | 'xr-spatial-tracking';
type PermissionState = 'denied' | 'granted' | 'prompt';
type PlaybackDirection =
  | 'alternate'
  | 'alternate-reverse'
  | 'normal'
  | 'reverse';
type PositionAlignSetting = 'auto' | 'center' | 'line-left' | 'line-right';
type PredefinedColorSpace = 'display-p3' | 'srgb';
type PremultiplyAlpha = 'default' | 'none' | 'premultiply';
type PresentationStyle = 'attachment' | 'inline' | 'unspecified';
type PublicKeyCredentialType = 'public-key';
type PushEncryptionKeyName = 'auth' | 'p256dh';
type RTCBundlePolicy = 'balanced' | 'max-bundle' | 'max-compat';
type RTCDataChannelState = 'closed' | 'closing' | 'connecting' | 'open';
type RTCDegradationPreference =
  | 'balanced'
  | 'maintain-framerate'
  | 'maintain-resolution';
type RTCDtlsTransportState =
  | 'closed'
  | 'connected'
  | 'connecting'
  | 'failed'
  | 'new';
type RTCEncodedVideoFrameType = 'delta' | 'empty' | 'key';
type RTCErrorDetailType =
  | 'data-channel-failure'
  | 'dtls-failure'
  | 'fingerprint-failure'
  | 'hardware-encoder-error'
  | 'hardware-encoder-not-available'
  | 'sctp-failure'
  | 'sdp-syntax-error';
type RTCIceCandidateType = 'host' | 'prflx' | 'relay' | 'srflx';
type RTCIceComponent = 'rtcp' | 'rtp';
type RTCIceConnectionState =
  | 'checking'
  | 'closed'
  | 'completed'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'new';
type RTCIceCredentialType = 'password';
type RTCIceGathererState = 'complete' | 'gathering' | 'new';
type RTCIceGatheringState = 'complete' | 'gathering' | 'new';
type RTCIceProtocol = 'tcp' | 'udp';
type RTCIceTcpCandidateType = 'active' | 'passive' | 'so';
type RTCIceTransportPolicy = 'all' | 'relay';
type RTCIceTransportState =
  | 'checking'
  | 'closed'
  | 'completed'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'new';
type RTCPeerConnectionState =
  | 'closed'
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'failed'
  | 'new';
type RTCPriorityType = 'high' | 'low' | 'medium' | 'very-low';
type RTCRtcpMuxPolicy = 'require';
type RTCRtpTransceiverDirection =
  | 'inactive'
  | 'recvonly'
  | 'sendonly'
  | 'sendrecv'
  | 'stopped';
type RTCSctpTransportState = 'closed' | 'connected' | 'connecting';
type RTCSdpType = 'answer' | 'offer' | 'pranswer' | 'rollback';
type RTCSignalingState =
  | 'closed'
  | 'have-local-offer'
  | 'have-local-pranswer'
  | 'have-remote-offer'
  | 'have-remote-pranswer'
  | 'stable';
type RTCStatsIceCandidatePairState =
  | 'failed'
  | 'frozen'
  | 'in-progress'
  | 'inprogress'
  | 'succeeded'
  | 'waiting';
type RTCStatsType =
  | 'candidate-pair'
  | 'certificate'
  | 'codec'
  | 'csrc'
  | 'data-channel'
  | 'inbound-rtp'
  | 'local-candidate'
  | 'media-source'
  | 'outbound-rtp'
  | 'peer-connection'
  | 'remote-candidate'
  | 'remote-inbound-rtp'
  | 'remote-outbound-rtp'
  | 'track'
  | 'transport';
type ReadyState = 'closed' | 'ended' | 'open';
type RecordingState = 'inactive' | 'paused' | 'recording';
type ReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';
type RemotePlaybackState = 'connected' | 'connecting' | 'disconnected';
type RequestCache =
  | 'default'
  | 'force-cache'
  | 'no-cache'
  | 'no-store'
  | 'only-if-cached'
  | 'reload';
type RequestCredentials = 'include' | 'omit' | 'same-origin';
type RequestDestination =
  | ''
  | 'audio'
  | 'audioworklet'
  | 'document'
  | 'embed'
  | 'font'
  | 'frame'
  | 'iframe'
  | 'image'
  | 'manifest'
  | 'object'
  | 'paintworklet'
  | 'report'
  | 'script'
  | 'sharedworker'
  | 'style'
  | 'track'
  | 'video'
  | 'worker'
  | 'xslt';
type RequestMode = 'cors' | 'navigate' | 'no-cors' | 'same-origin';
type RequestRedirect = 'error' | 'follow' | 'manual';
type ResidentKeyRequirement = 'discouraged' | 'preferred' | 'required';
type ResizeObserverBoxOptions =
  | 'border-box'
  | 'content-box'
  | 'device-pixel-content-box';
type ResizeQuality = 'high' | 'low' | 'medium' | 'pixelated';
type ResponseType =
  | 'basic'
  | 'cors'
  | 'default'
  | 'error'
  | 'opaque'
  | 'opaqueredirect';
type ScrollBehavior = 'auto' | 'smooth';
type ScrollLogicalPosition = 'center' | 'end' | 'nearest' | 'start';
type ScrollRestoration = 'auto' | 'manual';
type ScrollSetting = '' | 'up';
type SecurityPolicyViolationEventDisposition = 'enforce' | 'report';
type SelectionMode = 'end' | 'preserve' | 'select' | 'start';
type ServiceWorkerState =
  | 'activated'
  | 'activating'
  | 'installed'
  | 'installing'
  | 'parsed'
  | 'redundant';
type ServiceWorkerUpdateViaCache = 'all' | 'imports' | 'none';
type ShadowRootMode = 'closed' | 'open';
type SlotAssignmentMode = 'manual' | 'named';
type SpeechSynthesisErrorCode =
  | 'audio-busy'
  | 'audio-hardware'
  | 'canceled'
  | 'interrupted'
  | 'invalid-argument'
  | 'language-unavailable'
  | 'network'
  | 'not-allowed'
  | 'synthesis-failed'
  | 'synthesis-unavailable'
  | 'text-too-long'
  | 'voice-unavailable';
type TextTrackKind =
  | 'captions'
  | 'chapters'
  | 'descriptions'
  | 'metadata'
  | 'subtitles';
type TextTrackMode = 'disabled' | 'hidden' | 'showing';
type TouchType = 'direct' | 'stylus';
type TransferFunction = 'hlg' | 'pq' | 'srgb';
type UserVerificationRequirement = 'discouraged' | 'preferred' | 'required';
type VideoColorPrimaries = 'bt470bg' | 'bt709' | 'smpte170m';
type VideoFacingModeEnum = 'environment' | 'left' | 'right' | 'user';
type VideoMatrixCoefficients = 'bt470bg' | 'bt709' | 'rgb' | 'smpte170m';
type VideoTransferCharacteristics = 'bt709' | 'iec61966-2-1' | 'smpte170m';
type WebGLPowerPreference = 'default' | 'high-performance' | 'low-power';
type WorkerType = 'classic' | 'module';
type XMLHttpRequestResponseType =
  | ''
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text';
