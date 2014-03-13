-- addWord.lua (wordset, word, star) (word, notes)

if redis.call('EXISTS', KEYS[1]) == 1 then
  return false
end

redis.call('SADD', KEYS[1], ARGV[1])
redis.call('SET', KEYS[2], ARGV[2])
redis.call('INCR', KEYS[3])

return true
