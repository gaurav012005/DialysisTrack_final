from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'role', 'department', 'phone_number', 'is_active', 'date_joined', 'password')
        read_only_fields = ('id', 'date_joined')
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Only admin can change role, is_active, department
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.role != 'admin':
            validated_data.pop('role', None)
            validated_data.pop('is_active', None)
            validated_data.pop('department', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 
                 'phone_number')
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        # Force default role to 'patient' — role must be assigned by admin
        validated_data['role'] = 'patient'
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include username and password.')
        
        return data