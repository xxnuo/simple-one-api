package middleware

import (
	"net/http"
	"simple-one-api/pkg/config"
	"strings"

	"github.com/gin-gonic/gin"
)

// AdminAuth 管理员鉴权中间件
func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从请求头获取Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// 检查Authorization格式
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		// 获取token
		token := parts[1]

		// 检查token是否与配置文件中的API Key匹配
		if token != config.APIKey {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		c.Next()
	}
} 