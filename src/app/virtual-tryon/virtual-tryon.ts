import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WardrobeService } from '../services/wardrobe.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { WardrobeItem } from '../models/models';

interface AvatarCustomization {
  skinTone: string;
  gender: 'Male' | 'Female';
  height: number;
  bodyType: 'Slim' | 'Average' | 'Athletic';
}

@Component({
  selector: 'app-virtual-tryon',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './virtual-tryon.html',
  styleUrl: './virtual-tryon.css',
})
export class VirtualTryOn implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private avatar!: THREE.Group;
  private animationFrameId?: number;
  private avatarModel: any = null;
  private gltfLoader!: GLTFLoader;

  // Avatar body parts (from loaded 3D model)
  private bodyParts = {
    body: null as THREE.Mesh | null,
    head: null as THREE.Mesh | null,
    arms: null as THREE.Mesh | null,
    legs: null as THREE.Mesh | null,
  };

  // Clothing meshes that will overlay on the avatar
  private clothingMeshes = {
    top: null as THREE.Group | null,
    bottom: null as THREE.Group | null,
    shoes: null as THREE.Group | null,
    outer: null as THREE.Group | null,
    accessories: [] as THREE.Mesh[],
  };

  // State
  isLoading = signal(false);
  wardrobeItems = signal<WardrobeItem[]>([]);
  selectedCategory = signal<string>('All');
  showCustomization = signal(false);

  avatarCustomization = signal<AvatarCustomization>({
    skinTone: '#d4a574',
    gender: 'Male',
    height: 1.75,
    bodyType: 'Average'
  });

  appliedItems = signal<{
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    shoes?: WardrobeItem;
    outer?: WardrobeItem;
  }>({});

  categories = ['All', 'Top', 'Bottom', 'Shoes', 'Outer', 'Accessories'];

  skinTones = [
    { name: 'Light', color: '#f5d7c3' },
    { name: 'Fair', color: '#e8beac' },
    { name: 'Medium', color: '#d4a574' },
    { name: 'Tan', color: '#c68642' },
    { name: 'Brown', color: '#8d5524' },
    { name: 'Dark', color: '#5c4033' }
  ];

  constructor(
    private router: Router,
    private wardrobeService: WardrobeService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initThreeJS();
    this.loadWardrobeItems();
    this.loadUserGender();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.controls?.dispose();
    this.renderer?.dispose();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 3);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target.set(0, 1, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
    frontLight.position.set(0, 5, 5);
    this.scene.add(frontLight);

    // Initialize GLTF Loader
    this.gltfLoader = new GLTFLoader();

    // Create avatar
    this.loadAvatarModel();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Start animation loop
    this.animate();
  }

  private loadAvatarModel(): void {
    const customization = this.avatarCustomization();

    // For now, use the improved fallback avatar until we can source proper 3D models
    // Ready Player Me requires API key for production use
    this.toastService.info('Loading 3D avatar...');
    this.createImprovedAvatar();
  }

  private createImprovedAvatar(): void {
    this.avatar = new THREE.Group();
    const customization = this.avatarCustomization();
    const skinColor = new THREE.Color(customization.skinTone);
    const scale = 1.8;

    // HEAD - realistic proportions
    const headGeometry = new THREE.SphereGeometry(0.14 * scale, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.8,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.65 * scale;
    head.castShadow = true;
    this.avatar.add(head);
    this.bodyParts.head = head;

    // NECK
    const neckGeometry = new THREE.CylinderGeometry(0.06 * scale, 0.065 * scale, 0.12 * scale, 16);
    const neck = new THREE.Mesh(neckGeometry, headMaterial.clone());
    neck.position.y = 1.54 * scale;
    neck.castShadow = true;
    this.avatar.add(neck);

    // TORSO - Base mannequin body (will be covered by clothing)
    const torsoGeometry = new THREE.CylinderGeometry(
      0.18 * scale,
      0.16 * scale,
      0.5 * scale,
      24,
      8
    );
    const torsoMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4c5b0, // Neutral mannequin color
      roughness: 0.7,
      metalness: 0.1
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 1.23 * scale;
    torso.castShadow = true;
    this.avatar.add(torso);
    this.bodyParts.body = torso;

    // SHOULDERS
    const shoulderGeometry = new THREE.SphereGeometry(0.09 * scale, 16, 16);

    const leftShoulder = new THREE.Mesh(shoulderGeometry, torsoMaterial.clone());
    leftShoulder.position.set(-0.27 * scale, 1.45 * scale, 0);
    leftShoulder.castShadow = true;
    this.avatar.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, torsoMaterial.clone());
    rightShoulder.position.set(0.27 * scale, 1.45 * scale, 0);
    rightShoulder.castShadow = true;
    this.avatar.add(rightShoulder);

    // ARMS
    const armGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.045 * scale, 0.55 * scale, 16);

    const leftArm = new THREE.Mesh(armGeometry, headMaterial.clone());
    leftArm.position.set(-0.27 * scale, 1.13 * scale, 0);
    leftArm.castShadow = true;
    this.avatar.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, headMaterial.clone());
    rightArm.position.set(0.27 * scale, 1.13 * scale, 0);
    rightArm.castShadow = true;
    this.avatar.add(rightArm);

    // WAIST/HIPS - Base for pants
    const waistGeometry = new THREE.CylinderGeometry(0.17 * scale, 0.18 * scale, 0.15 * scale, 24);
    const waist = new THREE.Mesh(waistGeometry, torsoMaterial.clone());
    waist.position.y = 0.9 * scale;
    waist.castShadow = true;
    this.avatar.add(waist);

    // LEGS - realistic shape
    const legGeometry = new THREE.CylinderGeometry(0.09 * scale, 0.07 * scale, 0.8 * scale, 20);

    const leftLeg = new THREE.Mesh(legGeometry, torsoMaterial.clone());
    leftLeg.position.set(-0.1 * scale, 0.4 * scale, 0);
    leftLeg.castShadow = true;
    this.avatar.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, torsoMaterial.clone());
    rightLeg.position.set(0.1 * scale, 0.4 * scale, 0);
    rightLeg.castShadow = true;
    this.avatar.add(rightLeg);
    this.bodyParts.legs = rightLeg; // Store reference

    this.scene.add(this.avatar);

    // Add ground plane with shadow
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    this.scene.add(plane);

    this.toastService.success('3D avatar ready!');
  }

  private createFallbackAvatar(): void {
    // Redirect to improved avatar
    this.createImprovedAvatar();
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  private loadWardrobeItems(): void {
    this.isLoading.set(true);
    this.wardrobeService.getAll().subscribe({
      next: (items) => {
        this.wardrobeItems.set(items);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading wardrobe:', error);
        this.toastService.error('Failed to load wardrobe items');
        this.isLoading.set(false);
      }
    });
  }

  private loadUserGender(): void {
    const user = this.authService.currentUser();
    if (user?.gender) {
      this.avatarCustomization.update(custom => ({
        ...custom,
        gender: user.gender as 'Male' | 'Female'
      }));
    }
  }

  applyItemToAvatar(item: WardrobeItem): void {
    const category = item.category.toLowerCase();
    const scale = 1.8;

    // Remove existing clothing for this category
    if (category === 'top' && this.clothingMeshes.top) {
      this.avatar.remove(this.clothingMeshes.top);
      this.clothingMeshes.top = null;
    } else if (category === 'bottom' && this.clothingMeshes.bottom) {
      this.avatar.remove(this.clothingMeshes.bottom);
      this.clothingMeshes.bottom = null;
    } else if (category === 'shoes' && this.clothingMeshes.shoes) {
      this.avatar.remove(this.clothingMeshes.shoes);
      this.clothingMeshes.shoes = null;
    } else if (category === 'outer' && this.clothingMeshes.outer) {
      this.avatar.remove(this.clothingMeshes.outer);
      this.clothingMeshes.outer = null;
    }

    // Load texture from wardrobe item
    const textureLoader = new THREE.TextureLoader();

    if (category === 'top') {
      // Create realistic shirt/top mesh with ACTUAL TEXTURE
      const topGroup = new THREE.Group();

      // Load the item's image as a texture
      textureLoader.load(
        item.cloudinaryUrl,
        (texture) => {
          // Configure texture for better wrapping
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1);

          // Torso part with texture
          const torsoGeometry = new THREE.CylinderGeometry(
            0.2 * scale,
            0.18 * scale,
            0.52 * scale,
            32,
            8
          );
          const torsoMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.1
          });
          const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
          torso.position.y = 1.23 * scale;
          torso.castShadow = true;
          topGroup.add(torso);

          // Sleeves with same texture
          const sleeveGeometry = new THREE.CylinderGeometry(
            0.06 * scale,
            0.05 * scale,
            0.55 * scale,
            16
          );
          const sleeveMaterial = new THREE.MeshStandardMaterial({
            map: texture.clone(),
            roughness: 0.7,
            metalness: 0.1
          });

          const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
          leftSleeve.position.set(-0.27 * scale, 1.13 * scale, 0);
          leftSleeve.castShadow = true;
          topGroup.add(leftSleeve);

          const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial.clone());
          rightSleeve.position.set(0.27 * scale, 1.13 * scale, 0);
          rightSleeve.castShadow = true;
          topGroup.add(rightSleeve);

          // Collar/neck area
          const collarGeometry = new THREE.CylinderGeometry(
            0.08 * scale,
            0.11 * scale,
            0.08 * scale,
            16
          );
          const collar = new THREE.Mesh(collarGeometry, sleeveMaterial.clone());
          collar.position.y = 1.54 * scale;
          collar.castShadow = true;
          topGroup.add(collar);
        },
        undefined,
        (error) => {
          console.error('Error loading top texture:', error);
          // Fallback to color if texture fails
          const fallbackColor = this.getColorFromPrimaryColor(item.primaryColor);
          const fallbackMaterial = new THREE.MeshStandardMaterial({
            color: fallbackColor,
            roughness: 0.7,
            metalness: 0.1
          });

          const torsoGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.18 * scale, 0.52 * scale, 32, 8);
          const torso = new THREE.Mesh(torsoGeometry, fallbackMaterial);
          torso.position.y = 1.23 * scale;
          torso.castShadow = true;
          topGroup.add(torso);
        }
      );

      this.clothingMeshes.top = topGroup as any;
      this.avatar.add(topGroup);
      this.appliedItems.update(items => ({ ...items, top: item }));
      this.toastService.success(`Applied ${item.name} to avatar`);

    } else if (category === 'bottom') {
      // Create realistic pants/jeans mesh with TEXTURE
      const bottomGroup = new THREE.Group();

      textureLoader.load(
        item.cloudinaryUrl,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 2);

          // Create each pant leg with proper shape
          const legGeometry = new THREE.CylinderGeometry(
            0.11 * scale,
            0.09 * scale,
            0.85 * scale,
            24,
            8
          );
          const pantMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.85,
            metalness: 0.05
          });

          const leftPant = new THREE.Mesh(legGeometry, pantMaterial);
          leftPant.position.set(-0.1 * scale, 0.42 * scale, 0);
          leftPant.castShadow = true;
          bottomGroup.add(leftPant);

          const rightPant = new THREE.Mesh(legGeometry, pantMaterial.clone());
          rightPant.position.set(0.1 * scale, 0.42 * scale, 0);
          rightPant.castShadow = true;
          bottomGroup.add(rightPant);

          // Waist/belt area
          const waistGeometry = new THREE.CylinderGeometry(
            0.19 * scale,
            0.19 * scale,
            0.12 * scale,
            24
          );
          const waist = new THREE.Mesh(waistGeometry, pantMaterial.clone());
          waist.position.y = 0.9 * scale;
          waist.castShadow = true;
          bottomGroup.add(waist);
        },
        undefined,
        (error) => {
          console.error('Error loading bottom texture:', error);
          const fallbackColor = this.getColorFromPrimaryColor(item.primaryColor);
          const fallbackMaterial = new THREE.MeshStandardMaterial({
            color: fallbackColor,
            roughness: 0.85,
            metalness: 0.05
          });

          const legGeometry = new THREE.CylinderGeometry(0.11 * scale, 0.09 * scale, 0.85 * scale, 24, 8);
          const leftPant = new THREE.Mesh(legGeometry, fallbackMaterial);
          leftPant.position.set(-0.1 * scale, 0.42 * scale, 0);
          leftPant.castShadow = true;
          bottomGroup.add(leftPant);

          const rightPant = new THREE.Mesh(legGeometry, fallbackMaterial.clone());
          rightPant.position.set(0.1 * scale, 0.42 * scale, 0);
          rightPant.castShadow = true;
          bottomGroup.add(rightPant);
        }
      );

      this.clothingMeshes.bottom = bottomGroup as any;
      this.avatar.add(bottomGroup);
      this.appliedItems.update(items => ({ ...items, bottom: item }));
      this.toastService.success(`Applied ${item.name} to avatar`);

    } else if (category === 'shoes') {
      // Create realistic shoes mesh with TEXTURE
      const shoesGroup = new THREE.Group();

      textureLoader.load(
        item.cloudinaryUrl,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;

          const shoeMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.4,
            metalness: 0.3
          });

          // Create shoe body (main part)
          const shoeBodyGeometry = new THREE.BoxGeometry(
            0.15 * scale,
            0.08 * scale,
            0.3 * scale
          );

          // Create shoe toe (front rounded part)
          const shoeToeGeometry = new THREE.SphereGeometry(
            0.075 * scale,
            16,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
          );

          // Left shoe
          const leftShoeBody = new THREE.Mesh(shoeBodyGeometry, shoeMaterial);
          leftShoeBody.position.set(-0.1 * scale, 0.04 * scale, 0.05 * scale);
          leftShoeBody.castShadow = true;
          shoesGroup.add(leftShoeBody);

          const leftShoeToe = new THREE.Mesh(shoeToeGeometry, shoeMaterial.clone());
          leftShoeToe.position.set(-0.1 * scale, 0.04 * scale, 0.18 * scale);
          leftShoeToe.rotation.x = -Math.PI / 2;
          leftShoeToe.castShadow = true;
          shoesGroup.add(leftShoeToe);

          // Right shoe
          const rightShoeBody = new THREE.Mesh(shoeBodyGeometry, shoeMaterial.clone());
          rightShoeBody.position.set(0.1 * scale, 0.04 * scale, 0.05 * scale);
          rightShoeBody.castShadow = true;
          shoesGroup.add(rightShoeBody);

          const rightShoeToe = new THREE.Mesh(shoeToeGeometry, shoeMaterial.clone());
          rightShoeToe.position.set(0.1 * scale, 0.04 * scale, 0.18 * scale);
          rightShoeToe.rotation.x = -Math.PI / 2;
          rightShoeToe.castShadow = true;
          shoesGroup.add(rightShoeToe);
        },
        undefined,
        (error) => {
          console.error('Error loading shoes texture:', error);
          const fallbackColor = this.getColorFromPrimaryColor(item.primaryColor);
          const fallbackMaterial = new THREE.MeshStandardMaterial({
            color: fallbackColor,
            roughness: 0.4,
            metalness: 0.3
          });

          const shoeBodyGeometry = new THREE.BoxGeometry(0.15 * scale, 0.08 * scale, 0.3 * scale);
          const leftShoeBody = new THREE.Mesh(shoeBodyGeometry, fallbackMaterial);
          leftShoeBody.position.set(-0.1 * scale, 0.04 * scale, 0.05 * scale);
          leftShoeBody.castShadow = true;
          shoesGroup.add(leftShoeBody);

          const rightShoeBody = new THREE.Mesh(shoeBodyGeometry, fallbackMaterial.clone());
          rightShoeBody.position.set(0.1 * scale, 0.04 * scale, 0.05 * scale);
          rightShoeBody.castShadow = true;
          shoesGroup.add(rightShoeBody);
        }
      );

      this.clothingMeshes.shoes = shoesGroup as any;
      this.avatar.add(shoesGroup);
      this.appliedItems.update(items => ({ ...items, shoes: item }));
      this.toastService.success(`Applied ${item.name} to avatar`);

    } else if (category === 'outer') {
      // Create realistic jacket/outer garment with TEXTURE
      const outerGroup = new THREE.Group();

      textureLoader.load(
        item.cloudinaryUrl,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1);

          const jacketMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6,
            metalness: 0.2
          });

          // Jacket body (slightly larger than shirt)
          const jacketGeometry = new THREE.CylinderGeometry(
            0.23 * scale,
            0.21 * scale,
            0.55 * scale,
            32,
            8
          );
          const jacketBody = new THREE.Mesh(jacketGeometry, jacketMaterial);
          jacketBody.position.y = 1.23 * scale;
          jacketBody.castShadow = true;
          outerGroup.add(jacketBody);

          // Jacket sleeves (slightly larger than shirt sleeves)
          const jacketSleeveGeometry = new THREE.CylinderGeometry(
            0.07 * scale,
            0.06 * scale,
            0.6 * scale,
            16
          );

          const leftJacketSleeve = new THREE.Mesh(jacketSleeveGeometry, jacketMaterial.clone());
          leftJacketSleeve.position.set(-0.3 * scale, 1.13 * scale, 0);
          leftJacketSleeve.castShadow = true;
          outerGroup.add(leftJacketSleeve);

          const rightJacketSleeve = new THREE.Mesh(jacketSleeveGeometry, jacketMaterial.clone());
          rightJacketSleeve.position.set(0.3 * scale, 1.13 * scale, 0);
          rightJacketSleeve.castShadow = true;
          outerGroup.add(rightJacketSleeve);

          // Jacket collar
          const collarGeometry = new THREE.CylinderGeometry(
            0.1 * scale,
            0.12 * scale,
            0.1 * scale,
            16
          );
          const collar = new THREE.Mesh(collarGeometry, jacketMaterial.clone());
          collar.position.y = 1.54 * scale;
          collar.castShadow = true;
          outerGroup.add(collar);
        },
        undefined,
        (error) => {
          console.error('Error loading outer texture:', error);
          const fallbackColor = this.getColorFromPrimaryColor(item.primaryColor);
          const fallbackMaterial = new THREE.MeshStandardMaterial({
            color: fallbackColor,
            roughness: 0.6,
            metalness: 0.2
          });

          const jacketGeometry = new THREE.CylinderGeometry(0.23 * scale, 0.21 * scale, 0.55 * scale, 32, 8);
          const jacketBody = new THREE.Mesh(jacketGeometry, fallbackMaterial);
          jacketBody.position.y = 1.23 * scale;
          jacketBody.castShadow = true;
          outerGroup.add(jacketBody);
        }
      );

      this.clothingMeshes.outer = outerGroup as any;
      this.avatar.add(outerGroup);
      this.appliedItems.update(items => ({ ...items, outer: item }));
      this.toastService.success(`Applied ${item.name} to avatar`);
    }
  }

  private getColorFromPrimaryColor(primaryColor: string): number {
    // Try to parse as hex color first
    if (primaryColor.startsWith('#')) {
      return parseInt(primaryColor.substring(1), 16);
    }

    // Try to parse as rgb
    if (primaryColor.startsWith('rgb')) {
      const matches = primaryColor.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        return (r << 16) | (g << 8) | b;
      }
    }

    // Fallback to color name mapping
    return this.getColorFromString(primaryColor);
  }

  removeItem(category: string): void {
    const cat = category.toLowerCase();

    if (cat === 'top' && this.clothingMeshes.top) {
      this.avatar.remove(this.clothingMeshes.top);
      this.clothingMeshes.top = null;
      this.appliedItems.update(items => ({ ...items, top: undefined }));
    } else if (cat === 'bottom' && this.clothingMeshes.bottom) {
      this.avatar.remove(this.clothingMeshes.bottom);
      this.clothingMeshes.bottom = null;
      this.appliedItems.update(items => ({ ...items, bottom: undefined }));
    } else if (cat === 'shoes' && this.clothingMeshes.shoes) {
      this.avatar.remove(this.clothingMeshes.shoes);
      this.clothingMeshes.shoes = null;
      this.appliedItems.update(items => ({ ...items, shoes: undefined }));
    } else if (cat === 'outer' && this.clothingMeshes.outer) {
      this.avatar.remove(this.clothingMeshes.outer);
      this.clothingMeshes.outer = null;
      this.appliedItems.update(items => ({ ...items, outer: undefined }));
    }

    this.toastService.info(`Removed ${category} from avatar`);
  }

  changeSkinTone(color: string): void {
    this.avatarCustomization.update(custom => ({ ...custom, skinTone: color }));
    const skinColor = new THREE.Color(color);

    // Update skin tone on the loaded 3D model
    if (this.avatar) {
      this.avatar.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material && (child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('skin'))) {
            (child.material as THREE.MeshStandardMaterial).color.set(skinColor);
          }
        }
      });
    }

    this.toastService.success('Skin tone updated');
  }

  changeGender(gender: 'Male' | 'Female'): void {
    this.avatarCustomization.update(custom => ({ ...custom, gender }));

    // Remove current avatar
    if (this.avatar) {
      this.scene.remove(this.avatar);
    }

    // Clear clothing meshes
    Object.keys(this.clothingMeshes).forEach(key => {
      const mesh = this.clothingMeshes[key as keyof typeof this.clothingMeshes];
      if (mesh && this.avatar) {
        if (Array.isArray(mesh)) {
          mesh.forEach(m => this.avatar.remove(m));
        } else {
          this.avatar.remove(mesh);
        }
      }
    });

    // Reset clothing meshes
    this.clothingMeshes = {
      top: null,
      bottom: null,
      shoes: null,
      outer: null,
      accessories: [],
    };

    // Reload avatar model with new gender
    this.loadAvatarModel();

    // Store items to reapply after model loads
    const items = this.appliedItems();

    // Wait for model to load, then reapply clothing
    setTimeout(() => {
      if (items.top) this.applyItemToAvatar(items.top);
      if (items.bottom) this.applyItemToAvatar(items.bottom);
      if (items.shoes) this.applyItemToAvatar(items.shoes);
      if (items.outer) this.applyItemToAvatar(items.outer);
    }, 2000); // Give time for model to load

    this.toastService.success(`Changed to ${gender} avatar`);
  }

  clearAllClothing(): void {
    this.removeItem('top');
    this.removeItem('bottom');
    this.removeItem('shoes');
    this.removeItem('outer');
    this.toastService.info('Cleared all clothing');
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  get filteredItems(): WardrobeItem[] {
    const category = this.selectedCategory();
    if (category === 'All') {
      return this.wardrobeItems();
    }
    return this.wardrobeItems().filter(item => item.category === category);
  }

  private getColorFromString(colorName: string): number {
    const colorMap: { [key: string]: number } = {
      'red': 0xff0000,
      'blue': 0x0000ff,
      'green': 0x00ff00,
      'black': 0x000000,
      'white': 0xffffff,
      'gray': 0x808080,
      'grey': 0x808080,
      'yellow': 0xffff00,
      'orange': 0xffa500,
      'purple': 0x800080,
      'pink': 0xffc0cb,
      'brown': 0x8b4513,
      'navy': 0x000080,
      'beige': 0xf5f5dc,
    };

    const lower = colorName.toLowerCase();
    return colorMap[lower] || 0x808080;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
